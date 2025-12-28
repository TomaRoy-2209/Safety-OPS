<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MaintenanceTicket;
use Illuminate\Support\Facades\Auth;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Services\FCMService; // ✅ Import your Service

class MaintenanceController extends Controller
{
    // 1. Submit a Ticket (Citizen)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'category' => 'required',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,mp4,mov|max:20480',
        ]);

        $imageUrl = null;

        // Upload to Cloudinary
        if ($request->hasFile('image')) {
            $uploadedFile = Cloudinary::upload($request->file('image')->getRealPath(), [
                'folder' => 'maintenance_reports'
            ]);
            $imageUrl = $uploadedFile->getSecurePath();
        }

        $ticket = MaintenanceTicket::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
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
        // Eager load the user so we can access their token
        $ticket = MaintenanceTicket::with('user')->find($id);
        
        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $oldStatus = $ticket->status;
        $ticket->status = $request->status;
        $ticket->save();

        // 🔔 TRIGGER NOTIFICATION VIA YOUR FCM SERVICE
        // We only send if the status actually changed and the user has a token
        if ($ticket->status !== $oldStatus && $ticket->user && $ticket->user->fcm_token) {
            
            $title = "Maintenance Update 🛠️";
            $body = "Your report '{$ticket->title}' is now marked as: " . strtoupper($request->status);

            // ✅ Call your existing Service
            FCMService::send($ticket->user->fcm_token, $title, $body);
        }

        return response()->json(['message' => 'Maintenance Log Updated', 'ticket' => $ticket]);
    }
}