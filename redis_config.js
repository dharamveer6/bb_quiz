const Redis = require('ioredis');
console.log(process.env.redis_host)
console.log(process.env.redis_port)
console.log(process.env.redis_pass)
const redis = new Redis({
    host: process.env.redis_host,
    port: process.env.redis_port,
   password:process.env.redis_pass,
   maxRetriesPerRequest: 5,

});

// Set a key-value pair
redis.on('ready', () => {
    console.log('Connected to Redis successfully');
});
// Log errors if any occur during the connection process
redis.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
    return redis.quit();

});


module.exports={redis}