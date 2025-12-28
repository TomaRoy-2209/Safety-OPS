import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  // ... KEEP YOUR CONFIG HERE ...
  apiKey: "AIzaSyASNH9Z9Ux9-02rjvOzfR9liAKK0mJYrCI",
  authDomain: "safety-ops.firebaseapp.com",
  projectId: "safety-ops",
  storageBucket: "safety-ops.firebasestorage.app",
  messagingSenderId: "691293895604",
  appId: "1:691293895604:web:7677854e6a6f405d9a90e1"
};

const app = initializeApp(firebaseConfig);
let messaging = null;

if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
    console.log("✅ Firebase Messaging Initialized");
  } catch (err) {
    console.error("❌ Firebase Init Failed:", err);
  }
}

export const requestForToken = async () => {
  console.log("🚀 STARTING TOKEN REQUEST...");

  if (!messaging) return;

  try {
    // 1. Manually Register the Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log("✅ Service Worker Registered. Waiting for it to be active...");

    // 2. CRITICAL STEP: Wait for the Service Worker to be fully ready
    await navigator.serviceWorker.ready;
    console.log("✅ Service Worker is ACTIVE.");

    // 3. Get Token using the specific registration
    const currentToken = await getToken(messaging, { 
        vapidKey: 'BAwhE--DmT7nG5HGWIG_q95GM8d9OOWSBiU8H-nJqjsnZvD1F3A51NNH5uNrDbCFkL4srorB0r-Y1-EmAp6rWtg',
        serviceWorkerRegistration: registration 
    });

    if (currentToken) {
      console.log("🔥 FCM Token Received:", currentToken);

      const loginToken = localStorage.getItem('jwt');
      if (!loginToken) {
          console.log("No login token found (User logged out?)");
          return;
      }

      // 👇 FIX: Use Environment Variable
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

      await fetch(`${API_URL}/api/auth/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginToken}`
        },
        body: JSON.stringify({ token: currentToken }),
      });

      console.log("🎉 SUCCESS: Token saved to Database!");
    }
  } catch (err) {
    console.error('❌ Token Error:', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return; 
    onMessage(messaging, (payload) => {
      console.log("🔔 Message Received:", payload);
      resolve(payload);
    });
  });