const { createClient }  = require('redis');
require("dotenv").config({ path: "../.env" });

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10624.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 10624
    }
});

module.exports = redisClient;