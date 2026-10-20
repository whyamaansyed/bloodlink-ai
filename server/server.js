const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorMiddleware');
const User = require('./src/models/User');
const seedDatabase = require('./src/utils/seed');
const ensureDemoAccounts = require('./src/utils/ensureDemoAccounts');

// Load environment variables
dotenv.config();

const app = express();

// Body Parser & CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
}));

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/donors', require('./src/routes/donorRoutes'));
app.use('/api/hospitals', require('./src/routes/hospitalRoutes'));
app.use('/api/inventory', require('./src/routes/inventoryRoutes'));
app.use('/api/requests', require('./src/routes/requestRoutes'));
app.use('/api/demand', require('./src/routes/demandRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/donations', require('./src/routes/donationRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/thresholds', require('./src/routes/thresholdRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'SMART BLOOD BANK API Engine',
    timestamp: new Date()
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  await connectDB();
  
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Database is empty. Running seed script...');
    await seedDatabase(false);
  } else if (process.env.NODE_ENV !== 'production') {
    const createdDemoAccounts = await ensureDemoAccounts();
    if (createdDemoAccounts.length > 0) {
      console.log(`Added missing demo accounts: ${createdDemoAccounts.join(', ')}`);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 SMART BLOOD BANK API Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
