// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('No data in push event');
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'New content available',
      icon: data.icon || '/tripura-profile.png',
      badge: data.badge || '/tripura-profile.png',
      data: {
        url: data.url || '/',
        timestamp: data.timestamp || Date.now()
      },
      tag: 'reel-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: 'View Now'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Instagram Reel Viewer', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }

        // No window open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');
  // Handle subscription changes if needed
});
