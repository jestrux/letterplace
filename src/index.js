import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();

serviceWorker.register();


if ('serviceWorker' in navigator) {
    console.log("Service worker ipo, fanya vituz!!!")
    navigator.serviceWorker.register('../firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('FCM service worker successful, scope is:', registration.scope);
    }).catch(function(err) {
      console.log('FCM service worker registration failed, error:', err);
    });
}