<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Incident;
use App\Models\IncidentMedia;
use Illuminate\Support\Facades\DB;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Services\SMSService;
use App\Models\User;
use App\Services\FCMService;

class IncidentController extends Controller
{
    // --- SINGLE STEP REPORTING (Text + Cloudinary Upload) ---
    public function store(Request $request)
    {
        // 1. Validate Text AND File together
        // 🔴 FIX: Changed 'media' to 'evidence' to match React Frontend
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'latitude' => 'required', // Removed strict numeric for flexibility
            'longitude' => 'required',
            'evidence' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov|max:40960' 
        ]);

        return DB::transaction(function () use ($request, $validated) {
            
            // 2. Create the Incident
            $incident = Incident::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'status' => 'pending',
                'user_id' => auth()->id(),
            ]);

            // 3. Handle Cloudinary Upload IMMEDIATELY
            // 🔴 FIX: Looking for 'evidence', not 'media'
            if ($request->hasFile('evidence')) {
                
                // Upload to Cloudinary
                $uploadedFile = $request->file('evidence')->storeOnCloudinary('incidents');
                $url = $uploadedFile->getSecurePath();
                $fileType = $request->file('evidence')->getClientMimeType();
                $simpleFileType = str_starts_with($fileType, 'video') ? 'video' : 'image';

                // Save to IncidentMedia Table
                $media = new IncidentMedia();
                $media->incident_id = $incident->id;
                $media->file_path = $url;
                $media->file_type = $simpleFileType;
                $media->save();
            }

            return response()->json([
                'message' => 'Incident Reported Successfully',
                'incident' => $incident
            ], 201);
        });
    }

    // --- RESPONDER DASHBOARD FEED ---
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin' || $user->role === 'responder') {
            return Incident::with('evidence')->orderBy('created_at', 'desc')->get();
        }

        if ($user->role === 'worker') {
            return Incident::with('evidence')
                        ->where('assigned_agency', $user->unit)
                        ->orderBy('created_at', 'desc')
                        ->get();
        }

        return response()->json([], 403);
    }

    // --- CITIZEN "MY REPORTS" ---
    public function myReports()
    {
        return Incident::where('user_id', auth()->id())
                        ->with('evidence')
                        ->orderBy('created_at', 'desc')
                        ->get();
    }

    // --- ASSIGN UNIT (UPDATED WITH FCM) ---
     public function assign(Request $request, $id)
    {
        // 1. Permission Check
        if (auth()->user()->role !== 'admin' && auth()->user()->role !== 'responder') {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
       
        // 2. Update Incident Status
        $incident = Incident::find($id);
        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        $incident->assigned_agency = $request->agency;
        $incident->status = 'dispatched';
        $incident->save();

        // 3. NOTIFICATION LOGIC (SMS + FCM)
        $responder = User::where('unit', $request->agency)->first();

        $smsStatus = "No phone number found";
        $fcmStatus = "No FCM Token found";

        if ($responder) {
            // A. SEND SMS
            if ($responder->phone) {
                $msg = "ALERT: You have been assigned Incident #{$incident->id}: '{$incident->title}'. Priority: HIGH.";
                $sent = SMSService::send($responder->phone, $msg);
                $smsStatus = $sent ? "SMS Sent" : "SMS Failed";
            }

            // B. SEND PUSH NOTIFICATION
            if ($responder->fcm_token) {
                FCMService::send(
                    $responder->fcm_token,
                    "🚨 New Incident Assigned",
                    "You have been deployed to Incident #{$incident->id}: {$incident->title}"
                );
                $fcmStatus = "Notification Sent";
            }
        }
        $citizen = User::find($incident->user_id);

        if ($citizen && $citizen->fcm_token) {
            FCMService::send(
                $citizen->fcm_token,
                "🚑 Status Update: Help is Coming!",
                "Your report '{$incident->title}' has been dispatched to {$request->agency}. Stay safe."
            );
        }

        return response()->json([
            'message' => "Unit Dispatched. $smsStatus. $fcmStatus.",
            'incident_id' => $incident->id
        ], 200);
    }

    // --- PUBLIC MAP DATA ---
    public function getAll()
    {
        return response()->json([
            'status' => 'success',
            'data' => Incident::select('id', 'title', 'latitude', 'longitude', 'status')
                        ->whereNotNull('latitude')
                        ->get()
        ], 200);
    }
}