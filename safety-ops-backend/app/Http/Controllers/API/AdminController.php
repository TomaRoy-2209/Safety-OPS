<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class AdminController extends Controller
{
    // 1. Get List of All Users
    public function index()
    {
        $users = User::all(); // In a real app, you would paginate this
        return response()->json($users);
    }

    // 2. Change a User's Role
    public function updateRole(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Validate the input
        $request->validate([
            'role' => 'required|string|in:citizen,admin,responder,police,fire'
        ]);

        // Update the role
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $user
        ], 200);
    }
}
