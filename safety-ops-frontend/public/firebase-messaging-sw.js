importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyASNH9Z9Ux9-02rjvOzfR9liAKK0mJYrCI",
  authDomain: "safety-ops.firebaseapp.com",
  projectId: "safety-ops",
  storageBucket: "safety-ops.firebasestorage.app",
  messagingSenderId: "691293895604",
  appId: "1:691293895604:web:7677854e6a6f405d9a90e1"
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