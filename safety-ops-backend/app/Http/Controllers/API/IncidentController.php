<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Incident;
use App\Models\IncidentMedia;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class IncidentController extends Controller
{
// --- SABRINA'S FEATURE: Create Incident ---
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $incident = Incident::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'status' => 'pending',
            // FIX: Use the actual logged-in user's ID
            'user_id' => auth()->id(), 
        ]);

        return response()->json([
            'message' => 'Incident Reported Successfully',
            'incident' => $incident
        ], 201);
    }

    // --- IFRAD'S FEATURE: Upload Evidence ---
    public function uploadEvidence(Request $request, $incident_id)
    {
        $request->validate([
            'evidence' => 'required|file|mimes:jpg,jpeg,png,mp4|max:40960'
        ]);

        $incident = Incident::find($incident_id);
        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        $uploadedFile = $request->file('evidence')->storeOnCloudinary('incidents');
        $url = $uploadedFile->getSecurePath();
        $fileType = $request->file('evidence')->getClientMimeType();
        // Simplify mime type for frontend (image/jpeg -> image)
        $simpleFileType = str_starts_with($fileType, 'video') ? 'video' : 'image';

        $media = new IncidentMedia();
        $media->incident_id = $incident->id;
        $media->file_path = $url; // The Cloudinary URL
        $media->file_type = $simpleFileType; 
        $media->save();

        return response()->json([
            'message' => 'Upload successful',
            'url' => $url
        ], 201);
    }

    // --- RESPONDER DASHBOARD FEED (FETCH ALL + EVIDENCE) ---
    // --- RESPONDER / WORKER DASHBOARD FEED ---
    // --- RESPONDER / WORKER DASHBOARD FEED ---
    public function index()
    {
        $user = auth()->user();

        // 1. ADMIN & RESPONDER (Dispatcher): See EVERYTHING
        // They need to see all reports to decide who to dispatch.
        if ($user->role === 'admin' || $user->role === 'responder') {
            return Incident::with('evidence')
                        ->orderBy('created_at', 'desc')
                        ->get();
        }

        // 2. WORKER (Specialized Unit): See ONLY ASSIGNED
        // Strict filter. They only see what is specifically given to them.
        if ($user->role === 'worker') {
            return Incident::with('evidence')
                        ->where('assigned_agency', $user->unit) // Match Unit Name
                        ->orderBy('created_at', 'desc')
                        ->get();
        }

        return response()->json([], 403);
    }

// --- TARIN'S FEATURE: Citizen "My Reports" ---
    // --- TARIN'S FEATURE: Citizen "My Reports" ---
    public function myReports()
    {
        // FIX: Return the array directly so the frontend .map() works immediately
        return Incident::where('user_id', auth()->id()) 
                        ->with('evidence') 
                        ->orderBy('created_at', 'desc')
                        ->get();
    }

    // --- TOMA'S FEATURE: Assign Incident ---
    // Assign Unit (Now allowed for Responders too)
    // In IncidentController.php
    public function assign(Request $request, $id)
    {
        // Allow BOTH Admin and Responder(Dispatcher)
        if (auth()->user()->role !== 'admin' && auth()->user()->role !== 'responder') {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $incident = Incident::find($id);
        $incident->assigned_agency = $request->agency; 
        $incident->status = 'dispatched';
        $incident->save();

        return response()->json(['message' => 'Unit Dispatched'], 200);
    }

    // --- PUBLIC MAP DATA (Lightweight) ---
    public function getAll()
    {
        $incidents = Incident::select('id', 'title', 'latitude', 'longitude', 'status')
                        ->whereNotNull('latitude')
                        ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $incidents
        ], 200);
    }
}