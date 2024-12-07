const { redisClient, isRedisConnected } = require("./redisClient");

// Promisify Redis GET for async/await
const { promisify } = require("util");
const getAsync = promisify(redisClient.get).bind(redisClient);

//  generate a cache key based on query parameters
const generateCacheKey = (queryParams) => {
  return `expenses:${JSON.stringify(queryParams)}`;
};

//  Get expenses from Redis 
const getExpensesFromCache = async (req, res, next, getFromDatabase) => {
  try {
    const cacheKey = generateCacheKey(req.query);

    //  Fetch from Redis cache
    if (isRedisConnected) {
      const cachedData = await getAsync(cacheKey);
      if (cachedData) {
        console.log("Returning cached data");
        return res.status(200).json(JSON.parse(cachedData));
      }
    }

   
    console.log("Fetching from database");
    const expensesData = await getFromDatabase();
    const responseData = expensesData;

   
    if (isRedisConnected) {
      redisClient.setex(cacheKey, 3600, JSON.stringify(responseData)); 
    }

    return res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
};

module.exports = getExpensesFromCache;
