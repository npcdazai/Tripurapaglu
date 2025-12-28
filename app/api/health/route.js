import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';

export async function GET(request) {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        status: 'error',
        message: 'MongoDB URI not configured',
        details: 'Please add MONGODB_URI to environment variables'
      }, { status: 500 });
    }

    // Try to connect to MongoDB
    await connectDB();

    return NextResponse.json({
      status: 'ok',
      message: 'Server is running',
      mongodb: 'connected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    }, { status: 500 });
  }
}
