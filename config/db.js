import { MongoClient } from 'mongodb';
import { HttpError } from '../middleware/errorHandler.js';

const cache = globalThis.__mockbaseMongo || (globalThis.__mockbaseMongo = { client: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'your_mongodb_connection_string') {
    throw new HttpError(500, 'Database is not configured. Set MONGODB_URI in your environment.');
  }

  if (!cache.promise) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 });
    cache.promise = client
      .connect()
      .then((connected) => {
        cache.client = connected;
        return connected;
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }

  try {
    const client = await cache.promise;
    return client.db(process.env.DB_NAME || 'dummyjson_clone');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw new HttpError(500, 'Database connection failed.');
  }
}

export async function getCollection(name) {
  const db = await connectDB();
  return db.collection(name);
}

export async function closeDB() {
  if (cache.client) await cache.client.close();
  cache.client = null;
  cache.promise = null;
}