"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("citizen"); // Default or choose as needed
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Resolved to use your port (1801)
    const res = await fetch("http://localhost:1801/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("jwt", data.token);
      localStorage.setItem("role", data.user.role);
      setSuccess("Registered successfully! Redirecting to profile...");
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);
    } else {
      setError(data.error || data.message || "Registration failed!");
    }
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-gray-800">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold text-center mb-2">Register</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="password"
          value={passwordConfirmation}
          onChange={e => setPasswordConfirmation(e.target.value)}
          placeholder="Confirm Password"
          className="border p-2 w-full mb-4"
          required
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border p-2 w-full mb-5"
        >
          <option value="citizen">Citizen</option>
          <option value="admin">Admin</option>
          <option value="responder">Responder</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full rounded">Register</button>
        {error && <div className="text-red-500 mt-3 text-sm">{error}</div>}
        {success && <div className="text-green-600 mt-3 text-sm">{success}</div>}
        <p className="mt-4 text-center text-sm">
        Already have an account? <a href="/login" className="text-blue-500 underline">Login</a>
        </p>

      </form>
    </main>
  );
}