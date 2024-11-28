const Expense = require("../models/expense.schema.js");



const redisClient = require('../utils/redisClient.js');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const getExpensesFromCache = require('../utils/cache.getExpenses.Utils.js');
const moment = require('moment-timezone'); 



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

// Function to sanitize rows, ensuring there are no extra spaces
const sanitizeRow = (row) => {
  return Object.keys(row).reduce((acc, key) => {
    acc[key] = row[key] ? row[key].trim() : ''; // Remove extra spaces from values
    return acc;
  }, {});
};

// Bulk upload function for expenses
const bulkUploadExpenses = async (req, res) => {
  try {
    // Parse the CSV file
    const expenses = await parseCSV(req.file.path); 

    // Process each expense
    const formattedExpenses = expenses.map((exp) => {
      // console.log(exp); 

      // Sanitize the row data
      const sanitizedExp = sanitizeRow(exp);

      // Validate required fields
      if (!sanitizedExp.Name || !sanitizedExp.Amount || !sanitizedExp.Category || !sanitizedExp.PaymentMethod) {
        throw new Error("CSV contains invalid or missing fields");
      }

      // Ensure the Amount is a valid number (parse it to float)
      const amount = parseFloat(sanitizedExp.Amount);
      if (isNaN(amount)) {
        throw new Error(`Invalid amount value: ${sanitizedExp.Amount}`);
      }

      // Return the formatted expense object for further processing
      return {
        title: sanitizedExp.Name, 
        amount: amount, 
        category: sanitizedExp.Category, 
        paymentMethod: sanitizedExp.PaymentMethod, 
        user: req.user.id, 
      };
    });

    // await Expense.insertMany(formattedExpenses);


    // Respond with success message
    res.status(200).json({ message: 'Expenses uploaded successfully', data: formattedExpenses });

  } catch (error) {
    console.error(error);
    // Return an error response
    res.status(500).json({ error: error.message });
  }
};

// Function to parse the CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    // Use csv-parser or another library to parse the CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};


// Get a list of expenses with filters, sorting, and pagination
const getExpenses = async (req, res, next) => {
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

  // Construct filters for the database query
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

  // Function to query the database for expenses
  const getFromDatabase = async () => {
    const expenses = await Expense.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalExpenses = await Expense.countDocuments(filters);

    return {
      total: totalExpenses,
      page: parseInt(page),
      limit: parseInt(limit),
      data: expenses,
    };
  };
    // Use the cache function with fallback to the database
    getExpensesFromCache(req, res, next, getFromDatabase);
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
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const startOfMonth = moment.utc().startOf('month').toDate();
    const endOfMonth = moment.utc().endOf('month').toDate();

    const expenses = await Expense.find({
      user: userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const aggregatedStats = await Expense.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    if (aggregatedStats.length === 0) {
      console.log('No aggregated statistics found for the user in the current month.');
    }

    return res.status(200).json({
      expenses,
      aggregatedStats: aggregatedStats.length > 0 ? aggregatedStats[0] : null
    });
  } catch (err) {
    console.error('Error occurred:', err);
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
