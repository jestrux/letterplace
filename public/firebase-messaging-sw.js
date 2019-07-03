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

    // self.addEventListener('notificationclick', function(){
    //   clients.openWindow('http://letterplace.herokuapp.com');
    // });

    self.addEventListener('notificationclick', function (event){
      //For root applications: just change "'./'" to "'/'"
      //Very important having the last forward slash on "new URL('./', location)..."
      const rootUrl = new URL('./', location).href; 
      event.notification.close();
      event.waitUntil(
          clients.matchAll().then(matchedClients =>
          {
              for (let client of matchedClients)
              {
                  if (client.url.indexOf(rootUrl) >= 0)
                  {
                      return client.focus();
                  }
              }

              return clients.openWindow(rootUrl).then(function (client) { client.focus(); });
          })
      );
    });
  
    return self.registration.showNotification(
      notificationTitle, 
      notificationOptions
    );
});