self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/assets/e_location.png',
      badge: data.badge || '/assets/e_location.png',
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'view',
          title: 'Voir'
        },
        {
          action: 'close',
          title: 'Fermer'
        }
      ],
      requireInteraction: true,
      tag: data.data?.type || 'notification'
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view') {
    // Ouvrir l'application ou naviguer vers la page appropriée
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification fermée:', event.notification.tag);
});