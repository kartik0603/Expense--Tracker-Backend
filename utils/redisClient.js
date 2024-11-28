const { createClient } = require('redis'); // Import the Redis client
const dotenv = require('dotenv');  // Load environment variables

// Load environment variables from the .env file
dotenv.config();

// Define the Redis connection configuration
const redisClient =  createClient({
  password: 'xnq05MFRPl66nxfTqenE6lWhbjO20fDv',
  socket: {
      host: 'redis-10578.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
      port: 10578
  }
});



let isRedisConnected = false;

// Connect to Redis and handle any connection issues
redisClient.connect()
  .then(() => {
    isRedisConnected = true;
    console.log('Redis client connected');
  })
  .catch((err) => {
    isRedisConnected = false;
    console.error('Redis connection error:', err);
  });

// Handle Redis client errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Graceful shutdown (optional but good practice)
process.on('SIGINT', () => {
  console.log('Gracefully shutting down Redis client...');
  redisClient.quit(() => {
    console.log('Redis client closed.');
    process.exit(0);  // Ensure the app exits after closing Redis client
  });
});

// Export the Redis client for use throughout the app
module.exports = { redisClient, isRedisConnected };
