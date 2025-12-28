import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/middleware/auth';

export async function POST(request) {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured. Please add MONGODB_URI to environment variables.' },
        { status: 500 }
      );
    }

    await connectDB();

    const { username, password } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user._id, user.username, user.role);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        profileImage: user.profileImage
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
