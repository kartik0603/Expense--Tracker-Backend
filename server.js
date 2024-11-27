
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db.js');

const expenseRouter = require('./routes/expense.route.js');
const userRouter = require('./routes/user.route.js');

// Import Redis client
const redisClient = require('./utils/redisClient.js'); 



const app = express();


dotenv.config();

// Middleware
app.use(morgan('combined'));           
app.use(helmet());                   
app.use(cors());                     
app.use(bodyParser.json());          


app.use('/api/expenses', expenseRouter); 
app.use('/api/users', userRouter);      


app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Expense Management API' });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

// Graceful shutdown for Redis and HTTP server
const shutdown = (signal) => {
  console.log(`Received ${signal}. Closing HTTP server gracefully.`);
  redisClient.quit(() => {
    console.log('Redis client closed.');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
};

// Handle termination signals for graceful shutdown
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Catch unhandled rejections (useful for production)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
