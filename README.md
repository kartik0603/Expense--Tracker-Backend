# Expense Management API

This is an **Expense Management API** designed to allow users to manage their expenses efficiently. The API offers features for adding, updating, deleting, and retrieving expense records, as well as statistics on expenses. Users can also bulk upload expenses via CSV files.

### Project Features:
- **User Authentication**: Secure user registration, login, password reset, and authentication via JWT tokens.
- **Expense Management**: Add, update, delete, and fetch expenses with filters such as category, payment method, and date range.
- **Statistics**: Retrieve statistics about the user's expenses.
- **Bulk Upload**: Upload expenses in bulk through CSV files.
- **Redis Caching**: For optimized performance with frequent queries.
- **Graceful Shutdown**: Both HTTP server and Redis client are gracefully shut down during termination.

---


---

## Technologies Used
- **Node.js**: JavaScript runtime environment for server-side code.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB & Mongoose**: Database for storing user and expense data.
- **Redis**: In-memory data store for caching and fast access to frequently queried data.
- **JWT (JSON Web Token)**: Authentication and authorization mechanism.
- **CSV Upload**: For bulk importing expenses via CSV files.
- **Nodemailer**: For sending emails (password reset, notifications).
- **Helmet**: Security middleware to protect against well-known web vulnerabilities.
- **Multer**: Middleware for handling file uploads.
- **Bcrypt**: For hashing passwords securely.

---

## API Endpoints

### User Routes
- **POST `/api/users/register`**: Register a new user.
- **POST `/api/users/login`**: Login an existing user.
- **POST `/api/users/forget-password`**: Request password reset link.
- **POST `/api/users/reset-password/:token`**: Reset password using token.

### Expense Routes
- **POST `/api/expenses/add`**: Add a new expense.
- **POST `/api/expenses/bulk`**: Bulk upload expenses from a CSV file.
- **GET `/api/expenses/get`**: Fetch expenses with optional filters (category, payment method, date range, etc.).
- **GET `/api/expenses/stat`**: Get statistics of expenses.
- **PUT `/api/expenses/update/:id`**: Update an existing expense.
- **DELETE `/api/expenses/delete/:id`**: Delete a single expense by ID.
- **DELETE `/api/expenses/deleteMany`**: Delete multiple expenses at once.

### Middleware
- **Authentication**: All expense routes are protected by JWT authentication middleware.
- **Role-based Access**: Only authorized users can access certain endpoints.
