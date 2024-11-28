const { redisClient, isRedisConnected } = require("./redisClient");

// Promisify Redis GET for async/await
const { promisify } = require("util");
const getAsync = promisify(redisClient.get).bind(redisClient);

// Helper function to generate a cache key based on query parameters
const generateCacheKey = (queryParams) => {
  return `expenses:${JSON.stringify(queryParams)}`;
};

// Function to get expenses from Redis or fallback to database
const getExpensesFromCache = async (req, res, next, getFromDatabase) => {
  try {
    const cacheKey = generateCacheKey(req.query);

    // If Redis is connected, attempt to fetch from Redis cache
    if (isRedisConnected) {
      const cachedData = await getAsync(cacheKey);
      if (cachedData) {
        console.log("Returning cached data");
        return res.status(200).json(JSON.parse(cachedData));
      }
    }

    // If no cached data, fallback to database query
    console.log("Fetching from database");
    const expensesData = await getFromDatabase();
    const responseData = expensesData;

    // Cache the result in Redis if available
    if (isRedisConnected) {
      redisClient.setex(cacheKey, 3600, JSON.stringify(responseData)); // Cache for 1 hour
    }

    return res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
};

module.exports = getExpensesFromCache;
