<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth; // <--- FIXED IMPORT
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    // Signup/Register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'sometimes|string|in:citizen,admin,responder,worker', // Added 'worker' here just in case
            'phone' => 'nullable|string|min:11',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'citizen',
            'phone' => $request->phone,
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
        try {
            $credentials = $request->only('email', 'password');

            // Debug Point 1: Check if JWT Auth is loaded
            if (!method_exists(auth('api'), 'attempt')) {
                throw new \Exception("JWT Driver not found. Check config/auth.php guards.");
            }

            if (!$token = auth('api')->attempt($credentials)) {
                return response()->json(['error' => 'Unauthorized - Invalid Credentials'], 401);
            }

            return response()->json([
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'user' => auth('api')->user()
            ]);

        } catch (\Throwable $e) {
            // --- THIS IS THE MAGIC PART ---
            // It sends the ACTUAL error back to your browser console
            return response()->json([
                'error' => 'Login Crashed',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
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
    public function profile()
    {
        // Explicitly use the 'api' guard
        return response()->json(auth('api')->user());
    }

    // Update Profile
    public function updateProfile(Request $request)
    {
        // \Log::info($request->all()); // Uncomment for debugging
        $user = auth('api')->user(); // Explicit guard here too
        
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

    // Refresh Token
    public function refresh(Request $request)
    {
        try {
            $newToken = JWTAuth::parseToken()->refresh();
            return response()->json(['token' => $newToken]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unable to refresh token', 'details' => $e->getMessage()], 401);
        }
    }
    public function updateFcmToken(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        // 🚨 CRITICAL FIX: Explicitly tell Laravel to use the 'api' guard (JWT)
        // 'auth()->user()' might return null if the default guard is 'web'
        $user = auth('api')->user(); 

        if (!$user) {
            return response()->json(['message' => 'User not found or Token Invalid'], 401);
        }

        $user->fcm_token = $request->token;
        $user->save();

        return response()->json(['message' => 'Token updated successfully']);
    }

}
    