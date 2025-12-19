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

// Initialize App normally
const app = initializeApp(firebaseConfig);

// ⚠️ CHANGE STARTS HERE: Handle Server vs Client ⚠️
let messaging = null;

if (typeof window !== "undefined") {
  // We are in the browser, so it's safe to start Messaging
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.error("Firebase Messaging failed to init:", err);
  }
}
export const requestForToken = async () => {
  if (!messaging) return;

  try {
    const currentToken = await getToken(messaging, { 
        vapidKey: 'BAwhE--DmT7nG5HGWIG_q95GM8d9OOWSBiU8H-nJqjsnZvD1F3A51NNH5uNrDbCFkL4srorB0r-Y1-EmAp6rWtg' // Keep your existing VAPID key!
    });

    if (currentToken) {
      console.log("🔥 FCM Token Generated:", currentToken);

      // --- THE FIX: CHECK EVERY POSSIBLE NAME ---
      const loginToken = 
        localStorage.getItem('jwt') || 
        localStorage.getItem('token') || 
        localStorage.getItem('access_token') || 
        localStorage.getItem('auth_token');

      if (!loginToken) {
          // If we are on the login page, this error is normal. Ignore it.
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
             console.log("ℹ️ User not logged in yet. Waiting...");
             return;
          }
          console.error("❌ ERROR: Could not find ANY login token in localStorage. Please check Application tab.");
          return; 
      }

      console.log("✅ Found Login Token. Sending to Backend...");

      await fetch('http://127.0.0.1:1801/api/auth/fcm-token', {
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
    console.log('Error retrieving token:', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    // If messaging is null, never resolve (just sit silently)
    if (!messaging) return; 
    
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });





































