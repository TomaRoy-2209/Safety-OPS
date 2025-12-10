"use client";
import { useEffect, useState } from "react";

export default function ResponderDashboard() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const role = localStorage.getItem("role");
    if (!token || role !== "responder") {
      window.location.href = "/login";
      return;
    }
    fetch("http://localhost:1801/api/auth/profile", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data.user || data))
      .catch(() => setError("Could not fetch profile"));
  }, []);

  if (error) return <main className="h-screen flex items-center justify-center bg-gray-900 text-white">{error}</main>;
  if (!user) return <main className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</main>;

  return (
    <main className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-3xl font-bold mb-6 text-green-700">Responder Dashboard</h2>
        <p className="mb-2">Welcome, <b>{user.name}</b> (<b>RESPONDER</b>)</p>
        {/* Example responder alert */}
        <div className="my-4 p-4 bg-green-50 border-l-4 border-green-700 text-green-800 rounded">You can view and manage safety incidents.</div>
        <button
          onClick={() => {
            localStorage.removeItem('jwt');
            localStorage.removeItem('role');
            window.location.href = '/login';
          }}
          className="bg-red-500 text-white px-4 py-2 mt-6 rounded"
        >Logout</button>
      </div>
    </main>
  );
}
