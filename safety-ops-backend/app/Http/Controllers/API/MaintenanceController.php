<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MaintenanceTicket;
use Illuminate\Support\Facades\Auth;

class MaintenanceController extends Controller
{
    // 1. Submit a Ticket (Citizen)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'category' => 'required',
        ]);

        $ticket = MaintenanceTicket::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'user_id' => Auth::id(),
            'status' => 'open'
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
      // 4. Update Ticket Status (Admin fixes the issue)
    public function updateStatus(Request $request, $id)
    {
        $ticket = MaintenanceTicket::find($id);
        
        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found'], 404);
        }

        $ticket->status = $request->status; // 'in_progress' or 'resolved'
        $ticket->save();

        return response()->json(['message' => 'Maintenance Log Updated', 'ticket' => $ticket]);
    }

}
