const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../utils/logger');

let mongod = null;

/**
 * Connect to MongoDB with retry logic and graceful error handling
 * 
 * Features:
 * - Retry connection up to 3 times with exponential backoff
 * - Connection timeout handling
 * - Connection event listeners
 * - In-memory MongoDB for development
 * - Graceful cleanup on shutdown
 */
const connectDB = async (retries = 3, delay = 2000) => {
    try {
        let dbUri = process.env.MONGODB_URI;

        // Use in-memory MongoDB for development if no URI provided
        if (!dbUri || process.env.NODE_ENV === 'development') {
            mongod = await MongoMemoryServer.create();
            dbUri = mongod.getUri();
            logger.info('Using in-memory MongoDB for development');
        }

        // Mongoose connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        };

        const conn = await mongoose.connect(dbUri, options);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Connection event listeners for monitoring
        mongoose.connection.on('connected', () => {
            logger.info('MongoDB connection established');
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB connection lost. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB connection re-established');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', { error: err.message });
        });

        // Handle process termination - close MongoDB connection gracefully
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            if (mongod) {
                await mongod.stop();
                logger.info('In-memory MongoDB stopped');
            }
            process.exit(0);
        });

        return conn;

    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`, {
            retriesRemaining: retries - 1
        });

        if (retries > 0) {
            logger.info(`Retrying connection in ${delay}ms... (${retries} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return connectDB(retries - 1, delay * 2); // Exponential backoff
        }

        // Final failure - throw error to be handled by server.js
        throw new Error(`Failed to connect to MongoDB after multiple attempts: ${error.message}`);
    }
};

/**
 * Disconnect from MongoDB (useful for testing)
 */
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        if (mongod) {
            await mongod.stop();
        }
        logger.info('MongoDB disconnected successfully');
    } catch (error) {
        logger.error('Error disconnecting from MongoDB:', { error: error.message });
        throw error;
    }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
