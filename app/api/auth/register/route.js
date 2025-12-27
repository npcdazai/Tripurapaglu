import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/middleware/auth';

export async function POST(request) {
  try {
    await connectDB();

    const { username, password, role } = await request.json();

    // Validation
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['sender', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({ username, password, role });

    // Generate token
    const token = generateToken(user._id, user.username, user.role);

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
