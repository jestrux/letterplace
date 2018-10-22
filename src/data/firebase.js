import firebase from 'firebase/app';
// import 'firebase/auth';
import 'firebase/firestore';

// Initalize and export Firebase.
const config = {
  apiKey: 'AIzaSyAPXq-MNVvxrtR93dgHL7-YlsR0FXf3liU',
  authDomain: 'letterplace-c103c.firebaseapp.com',
  databaseURL: 'https://letterplace-c103c.firebaseio.com',
  projectId: 'letterplace-c103c',
  storageBucket: "letterplace-c103c.appspot.com",
  messagingSenderId: "658174549550"
};
firebase.initializeApp(config);

const firestore = firebase.firestore();

// Disable deprecated features
firestore.settings({
  timestampsInSnapshots: true
});

// firestore.enablePersistence();

export const db = firestore;