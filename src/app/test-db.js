const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const index = line.indexOf('=');
  if (index !== -1) {
    const key = line.substring(0, index).trim();
    const value = line.substring(index + 1).trim();
    envVars[key] = value;
  }
});

const MONGODB_URI = envVars.MONGODB_URI;

function getMongoUri(originalUri) {
  try {
    const uri = new URL(originalUri);
    const username = encodeURIComponent(decodeURIComponent(uri.username));
    const password = encodeURIComponent(decodeURIComponent(uri.password));
    const hosts = [
      'ac-pc5rtid-shard-00-00.az7utjv.mongodb.net:27017',
      'ac-pc5rtid-shard-00-01.az7utjv.mongodb.net:27017',
      'ac-pc5rtid-shard-00-02.az7utjv.mongodb.net:27017',
    ].join(',');
    const db = uri.pathname || '/blogdb';
    const appName = 'Blog';

    return `mongodb://${username}:${password}@${hosts}${db}?ssl=true&authSource=admin&replicaSet=atlas-nh7lyf-shard-0&retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`;
  } catch (e) {
    return originalUri;
  }
}

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
  }

  const manualUri = getMongoUri(MONGODB_URI);
  console.log('Trying Manual URI logic from mongodb.ts...');
  
  try {
    await mongoose.connect(manualUri);
    console.log('SUCCESS: Connected to MongoDB successfully with manual URI!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('FAILURE with manual URI.');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
