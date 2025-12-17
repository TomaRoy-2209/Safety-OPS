<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Events\NewMessage;

class ChatController extends Controller
{
    // 1. Get Chat History
    public function index($incidentId)
    {
        return Message::where('incident_id', $incidentId)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    // 2. Send Message
    public function send(Request $request, $incidentId)
    {
        $request->validate(['message' => 'required|string']);

        // 1. Save to Database (This works, we know it)
        $message = Message::create([
            'incident_id' => $incidentId,
            'user_id' => auth()->id(),
            'message' => $request->message
        ]);

        $messageData = $message->load('user');

        // 2. SEND DIRECTLY TO PUSHER (Bypassing Laravel Events)
        // We use the exact same code that worked in your test route
        try {
            $pusher = new \Pusher\Pusher(
                env('PUSHER_APP_KEY'),
                env('PUSHER_APP_SECRET'),
                env('PUSHER_APP_ID'),
                [
                    'cluster' => env('PUSHER_APP_CLUSTER'), 
                    'useTLS' => true,
                    // Fix for local SSL issues
                    'curl_options' => [CURLOPT_SSL_VERIFYPEER => false] 
                ]
            );

            // Channel: chat.15
            // Event Name: message.sent
            $pusher->trigger('chat.' . $incidentId, 'message.sent', $messageData);

        } catch (\Exception $e) {
            // Log error but don't stop the request
            \Log::error('Pusher Failed: ' . $e->getMessage());
        }

        return response()->json($messageData);
    }
}