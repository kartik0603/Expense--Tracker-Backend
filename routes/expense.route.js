/**
 
 * @swagger
 * components:
 *   schemas:
 *  Expense: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the expense',
            example: 'Groceries'
          },
          amount: {
            type: 'number',
            description: 'The amount of the expense',
            example: 50.0
          },
          category: {
            type: 'string',
            description: 'The category of the expense',
            example: 'Food'
          },
          paymentMethod: {
            type: 'string',
            description: 'The payment method used',
            enum: ['cash', 'credit'],
            example: 'cash'
          },
          user: {
            type: 'string',
            description: 'The user associated with the expense',
            example: 'UserId123'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'The date of the expense',
            example: '2024-11-25'
          }
        }
      }
 *
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the expense
 *                 example: "Groceries"
 *               amount:
 *                 type: number
 *                 description: The amount of the expense
 *                 example: 50.0
 *               category:
 *                 type: string
 *                 description: The category of the expense
 *                 example: "Food"
 *               paymentMethod:
 *                 type: string
 *                 description: The method of payment
 *                 enum: [cash, credit]
 *                 example: "cash"
 *     responses:
 *       201:
 *         description: Expense added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Expense added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Internal server error
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
 *                 description: The CSV file for bulk upload
 *     responses:
 *       200:
 *         description: Expenses uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Expenses uploaded successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       500:
 *         description: Error uploading CSV
 */

/**
 * @swagger
 * /api/expenses/get:
 *   get:
 *     summary: Get a list of expenses with filters, sorting, and pagination
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: The category of the expense
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *         description: The method of payment
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering expenses
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering expenses
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: A list of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of expenses
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Number of items per page
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       500:
 *         description: Error fetching expenses
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
 *         description: The expense ID to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the expense
 *               amount:
 *                 type: number
 *                 description: The amount of the expense
 *               category:
 *                 type: string
 *                 description: The category of the expense
 *               paymentMethod:
 *                 type: string
 *                 description: The method of payment
 *                 enum: [cash, credit]
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Expense updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: No data provided for update
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Error updating expense
 */

/**
 * @swagger
 * /api/expenses/delete/{id}:
 *   delete:
 *     summary: Delete a single expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The expense ID to be deleted
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       400:
 *         description: Provide an expense ID to delete
 *       404:
 *         description: Expense not found or not authorized to delete
 *       500:
 *         description: Error deleting expense
 */

/**
 * @swagger
 * /api/expenses/deleteMany:
 *   delete:
 *     summary: Delete multiple expenses by IDs
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
 *                 description: Array of expense IDs to be deleted
 *     responses:
 *       200:
 *         description: Expenses deleted successfully
 *       400:
 *         description: Provide an array of expense IDs to delete
 *       404:
 *         description: No expenses found for deletion
 *       500:
 *         description: Error deleting expenses
 */

/**
 * @swagger
 * /api/expenses/stat:
 *   get:
 *     summary: Get statistics for expenses in the current month
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: Statistics for the current month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 aggregatedStats:
 *                   type: object
 *                   properties:
 *                     totalAmount:
 *                       type: number
 *                       description: Total amount of expenses
 *                     count:
 *                       type: integer
 *                       description: Number of expenses
 *       500:
 *         description: Error fetching statistics
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
