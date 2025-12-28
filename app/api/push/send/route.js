import { NextResponse } from 'next/server';
import webPush from 'web-push';
import connectDB from '@/lib/utils/db';
import PushSubscription from '@/lib/models/PushSubscription';
import User from '@/lib/models/User';

// Configure web-push with fallback
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:noreply@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request) {
  try {
    // Check if push notifications are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.log('Push notifications not configured - skipping');
      return NextResponse.json({
        success: true,
        message: 'Push notifications not configured',
        sent: 0
      });
    }

    await connectDB();

    const { userId, title, body, icon, url } = await request.json();

    // Get user's push subscriptions
    let subscriptions;

    if (userId) {
      // Send to specific user
      subscriptions = await PushSubscription.find({ user: userId });
    } else {
      // Send to all viewers (for broadcast)
      const viewers = await User.find({ role: 'viewer' });
      const viewerIds = viewers.map(v => v._id);
      subscriptions = await PushSubscription.find({ user: { $in: viewerIds } });
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions found',
        sent: 0
      });
    }

    const payload = JSON.stringify({
      title: title || 'New Reel Shared!',
      body: body || 'A new Instagram reel has been shared with you',
      icon: icon || '/tripura-profile.png',
      badge: '/tripura-profile.png',
      url: url || '/tripura_mandavkar',
      timestamp: Date.now()
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          },
          payload
        );
        return { success: true };
      } catch (error) {
        console.error('Failed to send to subscription:', error);

        // If subscription is invalid, delete it
        if (error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }

        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} notifications`,
      sent: successCount,
      total: subscriptions.length
    });

  } catch (error) {
    console.error('Send push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
