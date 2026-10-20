const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-blood-bank';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    
    // Attempt standard connection with a short timeout to catch absent local MongoDB
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connected successfully via standard URI.');
  } catch (err) {
    console.warn('Standard MongoDB connection failed or timed out:', err.message);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Starting in-memory MongoDB fallback server...');
      try {
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`In-memory MongoDB connected successfully at ${memUri}`);
      } catch (memErr) {
        console.error('Failed to start in-memory MongoDB:', memErr.message);
        process.exit(1);
      }
    } else {
      console.error('Production MongoDB connection required. Exiting.');
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
