const mongoose = require('mongoose');
const { config } = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB successfully connected to host: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error(`Ensure MongoDB service is running locally on port 27017 or verify MONGODB_URI in server/.env`);
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost. Attempting reconnection...');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Event Error] ${err.message}`);
});

module.exports = {
  connectDB,
  mongoose,
};
