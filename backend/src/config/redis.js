// const { createClient }  = require('redis');
// require("dotenv").config({ path: "../.env" });

// const redisClient = createClient({
//     username: 'default',
//     password: process.env.REDIS_PASS,
//     socket: {
//         host: 'redis-10624.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
//         port: 10624
//     }
// });

// module.exports = redisClient;

const { createClient } = require('redis');
require("dotenv").config({ path: "../.env" });

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10624.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 10624,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.log('Redis: too many reconnect attempts, giving up.');
                return new Error('Redis reconnect failed');
            }
            return Math.min(retries * 100, 3000); // backoff, capped at 3s
        }
    }
});

redisClient.on('error', (err) => {
    console.log('Redis Client Error:', err.message);
});

redisClient.on('reconnecting', () => {
    console.log('Redis: reconnecting...');
});

redisClient.on('connect', () => {
    console.log('Redis: connected');
});

module.exports = redisClient;