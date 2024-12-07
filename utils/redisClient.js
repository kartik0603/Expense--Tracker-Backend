const { createClient } = require('redis'); 
require('dotenv').config();


//  Redis connection 
const redisClient =  createClient({
  password: 'xnq05MFRPl66nxfTqenE6lWhbjO20fDv',
  socket: {
      host: 'redis-10578.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
      port: 10578
  }
});



let isRedisConnected = false;

// Connect Redis 
redisClient.connect()
  .then(() => {
    isRedisConnected = true;
    console.log('Redis client connected');
  })
  .catch((err) => {
    isRedisConnected = false;
    console.error('Redis connection error:', err);
  });

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// shutdown 
process.on('SIGINT', () => {
  console.log('shutting down Redis client...');
  redisClient.quit(() => {
    console.log('Redis client closed.');
    process.exit(0);  ient
  });
});


module.exports = { redisClient, isRedisConnected };
