require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { initReminderScheduler } = require('./utils/reminderScheduler');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const familyRoutes = require('./routes/familyRoutes');
const historyRoutes = require('./routes/historyRoutes');

connectDB();

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:3000',
    credentials: true,
}));

app.use(morgan('combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later.' },
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: { code: 'RATE_LIMIT', message: 'Too many authentication attempts, please try again later.' },
    },
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/history', historyRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MediTrack API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initReminderScheduler();
});

