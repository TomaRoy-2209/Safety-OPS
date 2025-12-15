<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // Fetch all users (Existing)
    public function index()
    {
        return response()->json(User::orderBy('created_at', 'desc')->get());
    }

    // --- SABRINA'S FEATURE: Create Agency User ---
    public function createUser(Request $request)
    {
        // 1. Validate
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'agency' => 'nullable|string',
            'unit' => 'nullable|string',
            'role' => 'required|in:admin,responder,citizen,worker', 
        ]);

        // 2. Create User (Explicitly mapping fields)
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => $validated['role'],
            // Use the null coalescing operator ?? to ensure it's not undefined
            'agency' => $validated['agency'] ?? null,
            'unit' => $validated['unit'] ?? null,
        ]);

        return response()->json(['message' => 'User Created', 'user' => $user], 201);
    }
    
    // Update Role (Existing)
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();
        return response()->json(['message' => 'Role updated']);
    }
}