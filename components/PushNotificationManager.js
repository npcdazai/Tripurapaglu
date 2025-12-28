'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/config';

export default function PushNotificationManager({ token }) {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);

      // Show banner if permission not granted
      if (Notification.permission === 'default') {
        setTimeout(() => setShowBanner(true), 3000); // Show after 3 seconds
      }

      // Check if already subscribed
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  };

  const subscribeToPush = async () => {
    try {
      setLoading(true);

      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        alert('Notification permission denied. Please enable it in your browser settings.');
        setLoading(false);
        return;
      }

      // Register service worker
      let registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration) {
        registration = await registerServiceWorker();
        await navigator.serviceWorker.ready;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        )
      });

      // Send subscription to server
      await axios.post(
        `${API_URL}/api/push/subscribe`,
        {
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setIsSubscribed(true);
      setShowBanner(false);
      alert('✅ Push notifications enabled! You\'ll receive notifications when new reels are shared.');

    } catch (error) {
      console.error('Push subscription error:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from server
        await axios.delete(
          `${API_URL}/api/push/subscribe`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { endpoint: subscription.endpoint }
          }
        );

        setIsSubscribed(false);
        alert('Push notifications disabled');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      alert('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!('Notification' in window)) {
    return null;
  }

  return (
    <>
      {/* Floating notification banner */}
      {showBanner && permission === 'default' && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-2xl p-4 text-white">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-start gap-3">
              <div className="text-3xl">🔔</div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg mb-1">Get Instant Notifications!</h3>
                <p className="text-sm text-white/90 mb-3">
                  Never miss new reels! Get notified instantly when reels are shared, even when the browser is closed.
                </p>

                <button
                  onClick={subscribeToPush}
                  disabled={loading}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all w-full"
                >
                  {loading ? 'Enabling...' : '🔔 Enable Notifications'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification toggle button (top right) */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-lg transition-all ${
            isSubscribed
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
          }`}
          title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
        >
          {isSubscribed ? '🔔' : '🔕'}
          <span className="hidden md:inline">
            {loading
              ? 'Loading...'
              : isSubscribed
              ? 'Notifications ON'
              : 'Notifications OFF'}
          </span>
        </button>
      </div>
    </>
  );
}
