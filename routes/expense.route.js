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
