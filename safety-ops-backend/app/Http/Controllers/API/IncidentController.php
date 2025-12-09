<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Incident;
use App\Models\IncidentMedia;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class IncidentController extends Controller
{
    public function uploadEvidence(Request $request, $incident_id)
    {
        // 1. Check if file is real
        $request->validate([
            'evidence' => 'required|file|mimes:jpg,jpeg,png,mp4|max:40960'
        ]);

        // 2. Check if incident exists
        $incident = Incident::find($incident_id);
        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        // 3. Upload to Cloudinary
        $uploadedFile = $request->file('evidence')->storeOnCloudinary('incidents');
        $url = $uploadedFile->getSecurePath();
        $fileType = $request->file('evidence')->getClientMimeType();

        // 4. Save URL to Database
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
}