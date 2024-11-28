const redis = require('redis');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a Redis client with environment-specific configuration
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost', // Default to localhost if not provided
  port: process.env.REDIS_PORT || 6379,       // Default to Redis default port if not provided
  password: process.env.REDIS_PASSWORD || '', // Optionally provide password if needed
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // Return the error message when Redis is unavailable
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after one hour
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting after 10 attempts
      return undefined;
    }
    // Reconnect after a delay (in ms)
    return Math.max(options.attempt * 100, 3000);
  },
  connect_timeout: 10000, // Connection timeout in ms
  no_ready_check: true,   // Disable ready check for faster connection
});

let isRedisConnected = false;

// Connect to Redis and handle any connection issues
redisClient.connect().then(() => {
  isRedisConnected = true;
  console.log('Redis client connected');
}).catch(err => {
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
  });
});

// Export the Redis client for use throughout the app
module.exports = { redisClient, isRedisConnected };
