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
        // 1. Validate Input
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // 2. Create Incident in Database
        $incident = Incident::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'status' => 'pending',
            'user_id' => 1, // Hardcoded for Demo (or auth()->id())
        ]);

        return response()->json([
            'message' => 'Incident Reported Successfully',
            'incident' => $incident
        ], 201);
    }

    // --- IFRAD'S FEATURE: Upload Evidence ---
    public function uploadEvidence(Request $request, $incident_id)
    {
        // 1. Validate File
        $request->validate([
            'evidence' => 'required|file|mimes:jpg,jpeg,png,mp4|max:40960'
        ]);

        // 2. Find Incident
        $incident = Incident::find($incident_id);
        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        // 3. Upload to Cloudinary
        $uploadedFile = $request->file('evidence')->storeOnCloudinary('incidents');
        $url = $uploadedFile->getSecurePath();
        $fileType = $request->file('evidence')->getClientMimeType();

        // 4. Save Link to Database
        $media = new IncidentMedia();
        $media->incident_id = $incident->id;
        $media->file_path = $url;
        $media->file_type = $fileType;
        $media->save();

        return response()->json([
            'message' => 'Upload successful',
            'url' => $url
        ], 201);
    }

    // --- TARIN'S FEATURE: Fetch Reports ---
    public function index()
    {
        $incidents = Incident::where('user_id', 1)
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
}