import mongoose from 'mongoose';
import env from './env';

mongoose.set('strictQuery', true);

export async function connectMongo() {
  try {
    // If already connected or connecting, skip
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      return;
    }

    await mongoose.connect(env.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
