importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '658174549550'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    var notificationTitle = payload.notification.title || 'Letterplace Notification';
    var notificationOptions = {
      body: payload.notification.body || "Click to go to app.",
      icon: 'https://letterplace.herokuapp.com/static/media/logo.f81f4c25.png'
    };

    self.addEventListener('notificationclick', function(){
      clients.openWindow('http://letterplace.herokuapp.com');
    })
  
    return self.registration.showNotification(
      notificationTitle, 
      notificationOptions
    );
});