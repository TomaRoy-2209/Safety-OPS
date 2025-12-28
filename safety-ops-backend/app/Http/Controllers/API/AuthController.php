<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
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
            'role' => 'sometimes|string|in:citizen,admin,responder,worker',
            'phone' => 'nullable|string|min:11',
            'admin_secret' => 'nullable|string' // We use this field for both Admin Key and Dept Code
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 🔒 1. SECURITY CHECK: ADMIN
        if ($request->role === 'admin') {
            if ($request->admin_secret !== env('ADMIN_SECRET_KEY')) {
                return response()->json(['error' => 'Security Violation: Invalid Admin Secret Key.'], 403);
            }
        }

        // 🔒 2. SECURITY CHECK: RESPONDER (The Fix)
        // If they want to be Police/Fire, they must provide the Responder Code
        if ($request->role === 'responder') {
            if ($request->admin_secret !== env('RESPONDER_SECRET_KEY')) {
                 return response()->json(['error' => 'Verification Failed: Invalid Department/Badge Code.'], 403);
            }
        }

        // 🔒 3. BLOCK ONLY WORKERS (Municipality workers usually assigned by City Corp)
        // You can unlock this too if you want, but usually, these are manual.
        if ($request->role === 'worker') {
             return response()->json(['error' => 'Municipality Workers must be registered by the System Admin.'], 403);
        }

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'citizen',
            'phone' => $request->phone,
            'is_approved' => true // ✅ Auto-approve if they passed the code check
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

            // 1. Attempt to generate token
            if (!$token = auth('api')->attempt($credentials)) {
                return response()->json(['error' => 'Unauthorized - Invalid Credentials'], 401);
            }

            // 2. Get the Authenticated User
            $user = auth('api')->user();

            // 3. 🛡️ CHECK APPROVAL STATUS
            if ($user->is_approved == 0) {
                auth('api')->logout(); 
                return response()->json(['error' => 'Account is pending approval from Admin.'], 403);
            }

            // 4. Return Response
            return response()->json([
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'user' => $user
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Login Crashed',
                'message' => $e->getMessage(),
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
        return response()->json(auth('api')->user());
    }

    // Update Profile
    public function updateProfile(Request $request)
    {
        $user = auth('api')->user();
        
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

    // Update FCM Token
    public function updateFcmToken(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        $user = auth('api')->user(); 

        if (!$user) {
            return response()->json(['message' => 'User not found or Token Invalid'], 401);
        }

        $user->fcm_token = $request->token;
        $user->save();

        return response()->json(['message' => 'Token updated successfully']);
    }
}