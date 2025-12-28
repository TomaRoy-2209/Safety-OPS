<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Services\FCMService;
use App\Services\SMSService;

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
        // 1. Validate (Includes Agency/Unit for City Corp workers)
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,responder,citizen,worker', // ✅ Validates 'worker' role
            'agency' => 'nullable|string', // ✅ e.g. "City Corporation"
            'unit' => 'nullable|string',   // ✅ e.g. "Road Maintenance"
            'phone' => 'nullable|string',
        ]);

        // 2. Create User
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_approved' => true, // Admins create pre-approved users
            
            // ✅ Save the specific Department info
            'agency' => $validated['agency'] ?? null, 
            'unit' => $validated['unit'] ?? null,
            'phone' => $validated['phone'] ?? null,
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user]);
    }
    
    // Update Role (Existing)
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'role' => 'required|in:admin,responder,citizen,worker'
        ]);

        $user->role = $request->role;
        $user->save();
        
        return response()->json(['message' => 'Role updated', 'user' => $user]);
    }
    public function triggerDisasterMode(Request $request)
    {
        // 1. Security Check (Super Admin Only)
        // Adjust 'admin' to match your database role name exactly
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'UNAUTHORIZED: Commanders Only.'], 403);
        }

        // 2. Validate Message
        $request->validate([
            'message' => 'required|string|min:5|max:160', // SMS standard limit
        ]);

        $message = $request->message;
        $count = 0;

        // 3. Get All Citizens/Users who have contact info
        // We select only necessary columns to speed up the query
        $users = User::where('id', '!=', auth()->id()) // Don't alert the sender
                 ->where(function ($query) {
                     $query->whereNotNull('phone')
                           ->orWhereNotNull('fcm_token');
                 })
                 ->get(['id', 'phone', 'fcm_token', 'role']);

        // 4. The "Blast" Loop
        foreach ($users as $user) {
            
            // A. Send Push Notification (Free & Instant)
            if ($user->fcm_token) {
                FCMService::send(
                    $user->fcm_token,
                    "🚨 EMERGENCY ALERT", // Title
                    $message // Body
                );
            }

            // B. Send SMS (The "Wake Up" Call)
            // ⚠️ NOTE: In a real demo, this might use up your credits quickly if you have 50 users.
            if ($user->phone) {
                // Uncomment the line below to actually send SMS
                SMSService::send($user->phone, "EMERGENCY: " . $message);
            }

            $count++;
        }

        return response()->json([
            'message' => "Disaster Protocol Initiated. Broadcast sent to {$count} citizens.",
            'status' => 'success'
        ]);
    }
}