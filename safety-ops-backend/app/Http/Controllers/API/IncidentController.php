<?php


namespace App\Http\Controllers\API;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Incident;
use App\Models\IncidentMedia;
use Illuminate\Support\Facades\DB; // IMPORT THIS!
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;


class IncidentController extends Controller
{
    // --- SINGLE STEP REPORTING (Text + Cloudinary Upload) ---
    public function store(Request $request)
    {
        // 1. Validate Text AND File together
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov|max:40960' // Max 40MB
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
            if ($request->hasFile('media')) {
               
                // Upload to Cloudinary
                $uploadedFile = $request->file('media')->storeOnCloudinary('incidents');
                $url = $uploadedFile->getSecurePath();
                $fileType = $request->file('media')->getClientMimeType();
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


    // --- ASSIGN UNIT ---
    public function assign(Request $request, $id)
    {
        if (auth()->user()->role !== 'admin' && auth()->user()->role !== 'responder') {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
       
        $incident = Incident::find($id);
        $incident->assigned_agency = $request->agency;
        $incident->status = 'dispatched';
        $incident->save();


        return response()->json(['message' => 'Unit Dispatched'], 200);
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
