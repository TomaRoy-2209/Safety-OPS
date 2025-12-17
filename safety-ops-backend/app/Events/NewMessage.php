<?php
namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        // Load the user data so the frontend can display the name immediately
        $this->message = $message->load('user');
    }

    public function broadcastOn()
    {
        // We broadcast on a specific channel for this ONE incident
        // Example Channel Name: "chat.15" (for incident #15)
        return new Channel('chat.' . $this->message->incident_id);
    }
    // ADD THIS FUNCTION
    public function broadcastAs()
    {
        return 'message.sent';
    }
}