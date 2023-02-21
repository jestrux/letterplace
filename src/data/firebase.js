import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/messaging';

// Initalize and export Firebase.
const config = {
  apiKey: 'AIzaSyAPXq-MNVvxrtR93dgHL7-YlsR0FXf3liU',
  authDomain: 'letterplace-c103c.firebaseapp.com',
  databaseURL: 'https://letterplace-c103c.firebaseio.com',
  projectId: 'letterplace-c103c',
  storageBucket: "letterplace-c103c.appspot.com",
  messagingSenderId: "658174549550"
};

const app = firebase.initializeApp(config);

const firestore = app.firestore();
// Disable deprecated features
firestore.settings({
  timestampsInSnapshots: true
});

// firestore.enablePersistence();

export const base = app;
export const db = firestore;
export const auth = app.auth()
export const messaging = Notification ? app.messaging() : null;

export const google_auth_provider = new firebase.auth.GoogleAuthProvider()
export const fb_auth_provider = new firebase.auth.FacebookAuthProvider()


// NOTIFICATION SAMPLE
// {
//   "message": {
//     "notification": {
//       "title": "FCM Message",
//       "body": "This is a message from FCM"
//     }
//   },
//   "webpush": {
//       "fcm_options": {
//         "link": "http://letterplace.herokuapp.com"
//       }
//   },
//   "to": "fTd3hqzfdXk:APA91bEg7hWRmDJdTmVyn4-eJxhfCafOJhJUQAVEcjq8oXk2OwZ8VACD_Xhbc9ox_yit0haJWaDzKcYeghtqK6EkbPGfmNFkTZRtXmNBG7wqe88WWQloK2xrSHftPREsGZpTnWd1O2lr"
// }