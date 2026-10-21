const mongoose = require('mongoose');
const dns = require('dns');
const { config } = require('./env');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where custom DNS servers cannot be set
}

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
