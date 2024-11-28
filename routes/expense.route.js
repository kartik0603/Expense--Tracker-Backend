/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - title
 *         - amount
 *         - category
 *         - paymentMethod
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the expense
 *         title:
 *           type: string
 *           description: Title of the expense
 *         amount:
 *           type: number
 *           description: Amount of the expense
 *         category:
 *           type: string
 *           description: Category of the expense
 *         paymentMethod:
 *           type: string
 *           enum: ["cash", "credit"]
 *           description: Payment method used for the expense
 *         user:
 *           type: string
 *           description: ID of the user associated with the expense
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the expense was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the expense was last updated
 */

/**
 * @swagger
 * /api/expenses/add:
 *   post:
 *     summary: Add a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: Expense added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Missing required fields
 */

/**
 * @swagger
 * /api/expenses/bulk:
 *   post:
 *     summary: Bulk upload expenses from a CSV file
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing expense data
 *     responses:
 *       201:
 *         description: Expenses uploaded successfully
 *       400:
 *         description: No file uploaded or invalid CSV data
 */

/**
 * @swagger
 * /api/expenses/get:
 *   get:
 *     summary: Retrieve a list of expenses with optional filters, sorting, and pagination
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: "Filter expenses by category"
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *         description: "Filter expenses by payment method"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter expenses by start date"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Filter expenses by end date"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: "Field to sort by (default: createdAt)"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: "Sort order (default: desc)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "Page number for pagination (default: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Number of expenses per page (default: 10)"
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 */


/**
 * @swagger
 * /api/expenses/update/{id}:
 *   put:
 *     summary: Update an existing expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: ["cash", "credit"]
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 */

/**
 * @swagger
 * /api/expenses/delete/{id}:
 *   delete:
 *     summary: Delete a single expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the expense to delete
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */

/**
 * @swagger
 * /api/expenses/deleteMany:
 *   delete:
 *     summary: Delete multiple expenses
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Expenses deleted successfully
 *       404:
 *         description: No expenses found for deletion
 */

/**
 * @swagger
 * /api/expenses/stat:
 *   get:
 *     summary: Get statistics for expenses
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */

const express = require("express");
const expenseRouter = express.Router();

const protect = require("../middleware/auth.middleware.js");
const roleCheck = require("../middleware/roleCheck.middleware.js");
const {
  addExpense,
  bulkUploadExpenses,
  getExpenses,
  updateExpense,
  deleteManyExpense,
  deleteSingleExpense,

  getStatistics,
} = require("../controllers/expenseControler.js");

const upload = require("../utils/fileUpload.js");

expenseRouter.use(protect);

expenseRouter.post("/add", addExpense);
expenseRouter.post("/bulk", upload.single("file"), bulkUploadExpenses);

expenseRouter.get("/get", getExpenses);
expenseRouter.get("/stat", getStatistics);

expenseRouter.put("/update/:id", updateExpense);
expenseRouter.delete("/delete/:id", deleteSingleExpense);
expenseRouter.delete("/deleteMany", deleteManyExpense);

module.exports = expenseRouter;
