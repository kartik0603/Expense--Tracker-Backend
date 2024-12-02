require("dotenv").config();

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./config/db.js");
// const swaggerjsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const setupSwagger = require("./swagger.js");

const expenseRouter = require("./routes/expense.route.js");
const userRouter = require("./routes/user.route.js");

const swaggerJsDoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");



// Import Redis client
const redisClient = require("./utils/redisClient.js");


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Management API",
      version: "1.0.0",
      description: "API documentation for the Expense Management System",
    },
    servers: [
      {
        url: process.env.VERCEL_URL || "http://localhost:3000", 
        description: "API Server"
      }
    ], 
  },
  apis: ["./routes/*.js"], 
};


// Middleware
const app = express();
app.use(morgan("combined"));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

setupSwagger(app);

app.use("/api/expenses", expenseRouter);
app.use("/api/users", userRouter);

const specs = swaggerJsDoc(options);



// Middleware to dynamically set the server URL
app.use(
  "/api-docs",
  (req, res, next) => {
    if (!options.definition.servers.length) {
      const protocol = req.protocol;
      const host = req.get("host");
      options.definition.servers.push({
        url: `${protocol}://${host}`,
        description: "Deployed Server",
      });
    }
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(specs)
);





app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Expense Management API" });
});

const PORT = process.env.PORT || 3000;

// Graceful shutdown logic
const shutdown = (signal) => {
  console.log(`Received ${signal}. Closing HTTP server gracefully.`);

  if (isRedisConnected) {
    redisClient.quit(() => {
      console.log("Redis client closed.");
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    });
  } else {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  }
};

// Handle termination signals for graceful shutdown
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Catch unhandled rejections (useful for production)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  connectDB();
});
