const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    const dnsServers = process.env.DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean);
    if (dnsServers?.length) {
      try {
        dns.setServers(dnsServers);
      } catch (dnsErr) {
        console.warn('Could not set custom DNS servers:', dnsErr.message);
      }
    }

    if (!process.env.MONGODB_URI) {
      console.error('CRITICAL: MONGODB_URI environment variable is not defined!');
      console.error('Please configure MONGODB_URI in your cloud deployment environment variables.');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Tip: In MongoDB Atlas -> Network Access, ensure IP 0.0.0.0/0 (Allow access from anywhere) is added.');
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
