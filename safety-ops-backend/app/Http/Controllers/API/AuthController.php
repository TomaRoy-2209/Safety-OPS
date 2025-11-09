<?php

namespace App\Http\Controllers\API;

use Tymon\JWTAuth\Exceptions\JWTException; // Add this for clarity if needed

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // Signup/Register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'sometimes|string|in:citizen,admin,responder',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'citizen',
        ]);
        $token = JWTAuth::fromUser($user);
        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // Login
    public function login(Request $request)
    {
        $credentials = $request->only(['email', 'password']);
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $user = auth()->user();
        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'User logged out successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to logout.'], 500);
        }
    }

    // View Profile
    public function profile(Request $request)
    {
        return response()->json(['user' => auth()->user()]);
    }

    // Update Profile
    public function updateProfile(Request $request)
    {
        \Log::info($request->all());
        $user = auth()->user();
        $data = $request->only('name', 'password', 'password_confirmation');
        $rules = [
            'name' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:6|confirmed',
        ];
        $validator = Validator::make($data, $rules);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        if (isset($data['name'])) {
            $user->name = $data['name'];
        }
        if (isset($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();
        return response()->json(['user' => $user, 'message' => 'Profile updated successfully']);
    }
    //refresh
    public function refresh(Request $request)
{
    try {
        $newToken = JWTAuth::parseToken()->refresh();
        return response()->json(['token' => $newToken]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Unable to refresh token', 'details' => $e->getMessage()], 401);
    }
}
}
