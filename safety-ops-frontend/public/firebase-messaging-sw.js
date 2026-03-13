importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyBFG9hhk3irpyamx9kHp4PKhRFM1AYWD-o",
  authDomain: "safety-ops-16380.firebaseapp.com",
  projectId: "safety-ops-16380",
  storageBucket: "safety-ops-16380.firebasestorage.app",
  messagingSenderId: "159389224370",
  appId: "1:159389224370:web:995710d756d8f5c32b68ab"
};

// Initialize Firebase inside the Service Worker
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // You can change this to your logo path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});