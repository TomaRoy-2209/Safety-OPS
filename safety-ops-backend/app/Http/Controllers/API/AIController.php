<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Incident;
use OpenAI\Laravel\Facades\OpenAI;

class AIController extends Controller
{
    public function summarize($incidentId)
    {
        $incident = Incident::findOrFail($incidentId);

        // Construct the prompt
        $textToSummarize = "Title: " . $incident->title . "\nDescription: " . $incident->description;
        
        $prompt = "You are an emergency response assistant. Summarize the following incident into exactly 3 bullet points for a quick briefing:\n\n" . $textToSummarize;

        try {
            $result = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            $summary = $result->choices[0]->message->content;

            return response()->json(['summary' => $summary]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'AI Service Unavailable: ' . $e->getMessage()], 500);
        }
    }
}
