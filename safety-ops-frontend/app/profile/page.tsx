"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      window.location.href = "/login"; // redirect instantly
      return;
    }
    // Resolved to use your port (1801)
    fetch("http://localhost:1801/api/auth/profile", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user || data);
      })
      .catch(() => setError("Could not fetch profile"));
  }, []);

  if (error)
    return (
      <main className="h-screen flex items-center justify-center bg-gray-900 text-white">{error}</main>
    );
  if (!user)
    return (
      <main className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</main>
    );

  return (
    <main className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Role:</b> {user.role}</p>
        <button
          onClick={() => {
            localStorage.removeItem('jwt');
            window.location.href = '/login';
          }}
          className="bg-red-500 text-white px-4 py-2 mt-6 rounded"
        >
          Logout
        </button>
      </div>
    </main>
  );
}