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
    public function index()
    {
        // with('evidence') tells Laravel to attach the photos/videos to the JSON
        $incidents = Incident::with('evidence')
                        ->orderBy('created_at', 'desc')
                        ->get();
        
        return response()->json($incidents, 200);
    }

// --- TARIN'S FEATURE: Citizen "My Reports" ---
    public function myReports()
    {
        // FIX: Only fetch reports where user_id matches the authenticated user
        $incidents = Incident::where('user_id', auth()->id()) 
                        ->with('evidence') 
                        ->orderBy('created_at', 'desc')
                        ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $incidents
        ], 200);
    }

    // --- TOMA'S FEATURE: Assign Incident ---
    public function assign(Request $request, $id)
    {
        $incident = Incident::find($id);
        if (!$incident) return response()->json(['message' => 'Not found'], 404);

        $incident->assigned_agency = $request->agency;
        $incident->status = 'dispatched';
        $incident->save();

        return response()->json(['message' => 'Assigned!'], 200);
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