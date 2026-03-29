const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Initialize express app
const app = express();

// Set up middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

// Main Database Connection
connectDB();

// --- ROUTE FILES ---
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const jobs = require('./routes/jobRoutes');
const projects = require('./routes/projectRoutes');
const reviews = require('./routes/reviewRoutes');
const wallet = require('./routes/walletRoutes');
const payments = require('./routes/paymentRoutes');
const expenses = require('./routes/expenseRoutes');
const notifications = require('./routes/notificationRoutes');
const portfolio = require('./routes/portfolioRoutes');

// --- MOUNT ROUTERS ---
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/jobs', jobs);
app.use('/api/projects', projects);
app.use('/api/reviews', reviews);
app.use('/api/wallet', wallet);
app.use('/api/payments', payments);
app.use('/api/expenses', expenses);
app.use('/api/notifications', notifications);
app.use('/api/portfolio', portfolio);

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'WorkSetu API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


// Start the Application
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 WorkSetu Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
