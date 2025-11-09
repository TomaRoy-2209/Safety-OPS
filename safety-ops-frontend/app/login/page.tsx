"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("role", data.user.role);
      // Redirect based on role:
      if (data.user.role === "admin") {
        window.location.href = "/admin-dashboard";
      } else if (data.user.role === "responder") {
        window.location.href = "/responder-dashboard";
      } else {
        window.location.href = "/citizen-dashboard";
      }
      return;
    } else {
      setError(data.error || "Login failed!");
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-blue-700 via-purple-600 to-pink-400">
      <div className="w-full max-w-md p-10 bg-white/90 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col gap-6 border border-blue-200">
        <h2 className="text-4xl font-extrabold text-center text-blue-900 mb-4 tracking-tight drop-shadow-lg">
          Sign in to SafetyOps
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="border border-blue-300 rounded-lg p-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="border border-blue-300 rounded-lg p-3 w-full focus:border-purple-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            required
          />
          <button type="submit" className="mt-2 bg-gradient-to-r from-blue-700 to-purple-600 hover:from-purple-700 hover:to-pink-500 text-white text-lg py-3 rounded-xl shadow transition font-semibold">
            Login
          </button>
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded shadow-sm mt-2">
              {error}
            </div>
          )}
        </form>
        <p className="mt-2 text-center text-base text-blue-900">
          Don’t have an account?{" "}
          <a href="/register" className="text-purple-700 underline font-bold">Register</a>
        </p>
      </div>
    </main>
  );
}
