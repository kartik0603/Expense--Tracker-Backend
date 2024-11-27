const Expense = require("../models/expense.schema.js");

const parseCSV = require("../utils/csvParser.js");
const { promisify } = require('util');
const redisClient = require('../utils/redisClient.js');

// Promisify Redis GET for  async 
const getAsync = promisify(redisClient.get).bind(redisClient);

// Helper function to generate a cache key on query parameters
const generateCacheKey = (queryParams) => {
  return `expenses:${JSON.stringify(queryParams)}`;
};

// Add a new expense
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, paymentMethod } = req.body;

    // Validate input fields
    if (!title || !amount || !category || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new expense entry
    const expense = new Expense({
      title,
      amount,
      category,
      paymentMethod,
      user: req.user.id,
    });

    // Save the expense to the database
    await expense.save();

    res
      .status(201)
      .json({ message: "Expense added successfully", data: expense });
  } catch (err) {
    next(err);
  }
};

// Bulk upload expenses from a CSV file
const bulkUploadExpenses = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse CSV data
    const expenses = await parseCSV(req.file.path);

    // Validate and format expenses from the CSV file
    const formattedExpenses = expenses.map((exp) => {
      if (!exp.title || !exp.amount || !exp.category || !exp.paymentMethod) {
        throw new Error("CSV contains invalid or missing fields");
      }

      return {
        title: exp.title,
        amount: parseFloat(exp.amount),
        category: exp.category,
        paymentMethod: exp.paymentMethod,
        user: req.user.id,
      };
    });

    // Save the expenses to the database
    await Expense.insertMany(formattedExpenses);

    res.status(201).json({ message: "Expenses uploaded successfully" });
  } catch (err) {
    next(err);
  }
};

// Get a list of expenses with filters, sorting, and pagination
const getExpenses = async (req, res, next) => {
    try {
      const {
        category,
        paymentMethod,
        startDate,
        endDate,
        sortBy = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 10,
      } = req.query;
  
      const userId = req.user.id;
  
      // Construct filters for database query
      const filters = { user: userId };
  
      if (category) filters.category = category;
      if (paymentMethod) filters.paymentMethod = paymentMethod;
      if (startDate && endDate) {
        filters.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
  
      // Pagination settings
      const skip = (page - 1) * limit;
      const sortOrder = order === 'asc' ? 1 : -1;
  
      // Generate the cache key based on the query parameters
      const cacheKey = generateCacheKey(req.query);
  
      // Check if data is cached
      const cachedData = await getAsync(cacheKey);
      if (cachedData) {
        // If data is found in Redis cache, return it
        return res.status(200).json(JSON.parse(cachedData));
      }
  
      // Query the database for expenses
      const expenses = await Expense.find(filters)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);
  
      // Get the total number of expenses matching the filters
      const totalExpenses = await Expense.countDocuments(filters);
  
      // Paginated response
      const responseData = {
        total: totalExpenses,
        page: parseInt(page),
        limit: parseInt(limit),
        data: expenses,
      };
  
      // Cache the result in Redis with a TTL of 1 hour (3600 seconds)
      redisClient.setex(cacheKey, 3600, JSON.stringify(responseData));
  
      // Return the response
      res.status(200).json(responseData);
    } catch (err) {
      next(err);
    }
  };

// Update an existing expense
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    // Update the expense in the database
    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res
      .status(200)
      .json({ message: "Expense updated successfully", data: expense });
  } catch (err) {
    next(err);
  }
};

// Delete one or more expenses
const deleteManyExpense = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res
        .status(400)
        .json({ message: "Provide an array of expense IDs to delete" });
    }

    const result = await Expense.deleteMany({
      _id: { $in: ids },
      user: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No expenses found for deletion" });
    }

    res.status(200).json({ message: "Expenses deleted successfully" });
  } catch (err) {
    next(err);
  }
};

//   delete Single Expances
const deleteSingleExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Provide an expense ID to delete" });
    }

    const result = await Expense.deleteOne({ _id: id, user: req.user.id });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Expense not found or not authorized to delete" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get statistics
const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    res.status(200).json({ data: stats });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addExpense,
  bulkUploadExpenses,
  getExpenses,
  updateExpense,
  deleteManyExpense,
  deleteSingleExpense,

  getStatistics,
};
