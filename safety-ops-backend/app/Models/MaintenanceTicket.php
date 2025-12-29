<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MaintenanceTicket;
use Illuminate\Support\Facades\Auth;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Services\FCMService;

class MaintenanceController extends Controller
{
    // 1. Submit a Ticket (Citizen)
    public function store(Request $request)
    {
        // 🛡️ FIX: Added latitude/longitude to validation as 'nullable'
        // This prevents 422 errors when GPS is missing or empty
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'latitude' => 'nullable', 
            'longitude' => 'nullable',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,mp4,mov,webp,heic|max:20480', // Added webp/heic
        ]);

        $imageUrl = null;

        // Upload to Cloudinary
        if ($request->hasFile('image')) {
            // Using storeOnCloudinary is often more stable with the Laravel wrapper
            $uploadedFile = $request->file('image')->storeOnCloudinary('maintenance_reports');
            $imageUrl = $uploadedFile->getSecurePath();
        }

        // 🛡️ FIX: Convert empty strings "" to NULL for the database
        $lat = $request->latitude === '' || $request->latitude === 'null' ? null : $request->latitude;
        $long = $request->longitude === '' || $request->longitude === 'null' ? null : $request->longitude;

        $ticket = MaintenanceTicket::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'latitude' => $lat,
            'longitude' => $long,
            'user_id' => Auth::id(),
            'status' => 'open',
            'image_path' => $imageUrl
        ]);

        return response()->json(['message' => 'Ticket Created', 'ticket' => $ticket], 201);
    }

    // 2. View My Tickets (Citizen)
    public function myTickets()
    {
        return MaintenanceTicket::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();
    }

    // 3. View All Tickets (Admin)
    public function index()
    {
        return MaintenanceTicket::with('user')->orderBy('created_at', 'desc')->get();
    }

    // 4. Update Ticket Status (Admin) & Notify Citizen
    public function updateStatus(Request $request, $id)
    {
        $ticket = MaintenanceTicket::with('user')->find($id);
        
        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $oldStatus = $ticket->status;
        $ticket->status = $request->status;
        $ticket->save();

        // 🔔 NOTIFICATION
        if ($ticket->status !== $oldStatus && $ticket->user && $ticket->user->fcm_token) {
            
            $title = "Maintenance Update 🛠️";
            $body = "Your report '{$ticket->title}' is now marked as: " . strtoupper($request->status);

            FCMService::send($ticket->user->fcm_token, $title, $body);
        }

        return response()->json(['message' => 'Maintenance Log Updated', 'ticket' => $ticket]);
    }
}