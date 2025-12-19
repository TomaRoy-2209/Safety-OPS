"use client"; // <--- This magic line makes hooks work!

import { useEffect } from "react";
// Make sure this path points to where you actually put the firebase.js file from the PDF
import { requestForToken, onMessageListener } from "../../firebase"; 

const FCMListener = () => {
  useEffect(() => {
    // 1. Ask for permission (Browser Popup)
    requestForToken();

    // 2. Listen for incoming messages while the app is open
    const unsubscribe = onMessageListener().then((payload: any) => {
      // You can replace this alert with a nice toast notification later
      alert(`🔔 New Alert: ${payload?.notification?.title}\n${payload?.notification?.body}`);
      console.log("Foreground Message Received:", payload);
    });

    return () => {
      // Optional cleanup if needed
    };
  }, []);

  return null; // This component doesn't show anything visual
};

export default FCMListener;