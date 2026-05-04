require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

const { initReminderScheduler } = require('./utils/reminderScheduler');
const logger = require('./utils/logger');
const globalErrorHandler = require('./middleware/globalErrorHandler');
const notFound = require('./middleware/notFound');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');

const medicineRoutes = require('./routes/medicineRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const familyRoutes = require('./routes/familyRoutes');
const historyRoutes = require('./routes/historyRoutes');

connectDB();

const app = express();

// Security headers via Helmet (proper HTTP headers, not invalid meta tags)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "http://localhost:5000", "https://localhost:5000"],
            frameAncestors: process.env.NODE_ENV === 'production' ? ["'none'"] : ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors({

    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/history', historyRoutes);


app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MediTrack API is running' });
});

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    // Handle React routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}

// 404 handler - must be AFTER all routes
app.use(notFound);

// Global error handler - must be LAST
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions - prevents server crash
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
        name: err.name,
        message: err.message,
        stack: err.stack
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', {
        name: err.name,
        message: err.message,
        stack: err.stack
    });
    // Graceful shutdown
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM (e.g., from Docker, Heroku)
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated gracefully.');
    });
});

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    initReminderScheduler();
});
