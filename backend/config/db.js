const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
    try {
        let dbUri = process.env.MONGODB_URI;

        if (!dbUri || process.env.NODE_ENV === 'development') {
            mongod = await MongoMemoryServer.create();
            dbUri = mongod.getUri();
            console.log('Using in-memory MongoDB for development');
        }

        const conn = await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

