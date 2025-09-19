const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean'); // ✅
const hpp = require('hpp'); // ✅

// Initialize app
const app = express();

// ✅ Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Enable CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'development' ?
        'http://localhost:3001' : 'your-production-domain.com',
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross-site scripting)
app.use(xss());

// ✅ Prevent HTTP Parameter Pollution
// ✅ Prevent HTTP Parameter Pollution
app.use(hpp({
    whitelist: [

        'Location',
        'Country',
        'Category',
        'Visitors',
        'Rating',
        'Revenue',
        'Accommodation_Available',
        'sort',
        'limit',
        'page',
        'fields'
    ]
}));


// ✅ Rate Limiting Middleware
const limiter = rateLimit({
    max: 100, // أقصى عدد ريكويستات من نفس الـ IP
    windowMs: 60 * 60 * 1000, // خلال ساعة
    message: 'Too many requests from this IP, please try again in an hour!'
});

// نطبقه على كل الـ /api
app.use('/api', limiter);

// Serve static files based on environment
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
} else {
    app.use(express.static(path.join(__dirname, 'public')));
}

// Custom middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// API Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle React in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'overview.html'));
    });
}

module.exports = app;