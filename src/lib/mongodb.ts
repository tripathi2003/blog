import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI as string | undefined;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache;
}

let cached: MongooseCache = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

function getMongoUri() {
  if (MONGODB_DIRECT_URI) return MONGODB_DIRECT_URI;

  const uri = new URL(MONGODB_URI);
  if (uri.protocol !== 'mongodb+srv:' || uri.hostname !== 'blog.az7utjv.mongodb.net') {
    return MONGODB_URI;
  }

  const username = encodeURIComponent(decodeURIComponent(uri.username));
  const password = encodeURIComponent(decodeURIComponent(uri.password));
  const hosts = [
    'ac-pc5rtid-shard-00-00.az7utjv.mongodb.net:27017',
    'ac-pc5rtid-shard-00-01.az7utjv.mongodb.net:27017',
    'ac-pc5rtid-shard-00-02.az7utjv.mongodb.net:27017',
  ].join(',');
  const db = uri.pathname || '/blogdb';
  const appName = uri.searchParams.get('appName') || 'blog';

  return `mongodb://${username}:${password}@${hosts}${db}?ssl=true&authSource=admin&replicaSet=atlas-nh7lyf-shard-0&retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(getMongoUri(), { bufferCommands: false })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}

export default connectDB;
