const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for both User authentication and Expense management.",
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production" 
          ? "https://expense-tracker-backend-ds3h.onrender.com/api" // Deployed URL for production
          : "http://localhost:3000/api", // Local URL for development
        description: "API Server"
      },
    ],
  },
  apis: ["./routes/*.js"], // This will include both user and expense routes
  components: {
    schemas: {
      // User schema
      User: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'The username of the user',
            example: 'john_doe'
          },
          password: {
            type: 'string',
            description: 'The password of the user',
            example: 'password123'
          },
          email: {
            type: 'string',
            description: 'The email of the user',
            example: 'johndoe@example.com'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date when the user was created',
            example: '2024-11-25T10:00:00Z'
          },
        },
      },
      // Expense schema
      Expense: {
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
    },
  },
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
