<?php

namespace App\Events;

use App\Models\Incident;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class IncidentReported implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $incident;

    // Pass the incident data when the event is created
    public function __construct(Incident $incident)
    {
        $this->incident = $incident;
    }

    // Broadcast on a public channel called 'incidents'
    public function broadcastOn()
    {
        return new Channel('incidents');
    }
    
    // Optional: Name the event 'new-incident'
    public function broadcastAs()
    {
        return 'new-incident';
    }
}