const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.CS172668_DB_CONNECT_STRING)
}

module.exports = main;
