const mongoose = require('mongoose');
const MONGO_URI = require('./configs/db.json').MONGO_URI
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("DB connected");

    } catch (err) {
        console.error("Database connection error:", err);
    }
}

module.exports = connectDB;
