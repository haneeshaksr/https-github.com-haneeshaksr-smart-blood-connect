import mongoose from 'mongoose';

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.log('[Mongoose] MONGODB_URI not provided or contains placeholder credentials. Running with persistent memory store.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Mongoose] Successfully connected to MongoDB Atlas cluster.');
    return true;
  } catch (err: any) {
    console.warn('[Mongoose] Notice: Could not connect to external MongoDB cluster (' + err.message + '). App will continue operating seamlessly.');
    return false;
  }
}
