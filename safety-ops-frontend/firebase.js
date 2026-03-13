import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBFG9hhk3irpyamx9kHp4PKhRFM1AYWD-o",
  authDomain: "safety-ops-16380.firebaseapp.com",
  projectId: "safety-ops-16380",
  storageBucket: "safety-ops-16380.firebasestorage.app",
  messagingSenderId: "159389224370",
  appId: "1:159389224370:web:995710d756d8f5c32b68ab"
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
        vapidKey: 'BEZD9c0IULSnAU8vEb84xGFPSf7XU8RVioo-ovgSc2xaDRBMw9ae-9QzA9RD0lC1BbrGEwccN_An9rDWhkGQB2A',
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