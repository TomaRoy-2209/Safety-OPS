<?php

namespace App\Http\Controllers;
use App\Models\Incident;
use App\Models\Responder;
use Illuminate\Http\Request;
use Xenon\LaravelBDSms\Facades\SMS;

class IncidentController extends Controller {
    public function index() {
        return Incident::all();
    }

    public function store(Request $request) {

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'priority' => 'nullable|integer',
        ]);

        $incident = Incident::create($request->only([
            'title',
            'description',
            'location',
            'type',
            'priority'
        ]));

        // Fetch all responders' numbers from DB
        $numbersArray = Responder::pluck('phone_number')->toArray();
        // Convert array to comma-separated string for SMS
        $numbersString = implode(',', $numbersArray);
        // Prepare message
        $message = 'High Priority! Respond to incident: ' . $incident->title;
        // Send SMS
        SMS::shoot($numbersString, $message);
        return response()->json($incident, 201);
    }

    public function show($id) {
        return Incident::find($id);
    }

    public function update(Request $request, $id) {
        // Validate update request using same rules (optional)
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'location' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'priority' => 'nullable|integer',
        ]);

        $incident = Incident::findOrFail($id);
        $incident->update($request->only([
            'title',
            'description',
            'location',
            'type',
            'priority'
        ]));
        // To send SMS on updates, uncomment below lines:
        // $numbersArray = Responder::pluck('phone_number')->toArray();
        // $numbersString = implode(',', $numbersArray);
        // $message = 'Incident updated: ' . $incident->title;
        // SMS::shoot($numbersString, $message);
        return response()->json($incident);
    }

    public function destroy($id) {
        Incident::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    // Assign an incident to an agency
    public function assign(Request $request, $id)
    {
        $incident = Incident::find($id);

        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        // Validate input
        $request->validate([
            'agency' => 'required|string'
        ]);

        // Update the incident
        $incident->assigned_agency = $request->agency;
        $incident->status = 'dispatched'; // Change status
        $incident->save();

        return response()->json([
            'message' => 'Incident assigned successfully',
            'data' => $incident
        ], 200);
    }
}
