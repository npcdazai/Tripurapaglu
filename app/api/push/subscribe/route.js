import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import PushSubscription from '@/lib/models/PushSubscription';
import { verifyToken } from '@/lib/middleware/auth';

export async function POST(request) {
  try {
    await connectDB();

    // Verify token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { subscription, userAgent } = await request.json();

    // Save or update subscription
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        user: decoded.userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        },
        userAgent: userAgent || ''
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription saved'
    });

  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    await PushSubscription.deleteOne({ endpoint, user: decoded.userId });

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription removed'
    });

  } catch (error) {
    console.error('Push unsubscription error:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
