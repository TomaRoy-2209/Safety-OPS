<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Incident;

class SummarizeController extends Controller
{
    public function generateSummary($id)
    {
        // 1. Find the Incident
        $incident = Incident::find($id);
        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        // 2. Check API Key
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            Log::error("❌ Gemini Error: Missing API Key in .env");
            return response()->json(['message' => 'Server Configuration Error: Missing API Key'], 500);
        }

        // 3. Prepare the Prompt
        $textToAnalyze = "Title: " . $incident->title . "\nDescription: " . $incident->description;
        $prompt = "You are an emergency response admin. Summarize the following incident report into exactly 3 short, punchy bullet points. Focus on: What happened, Location context, and Immediate needs. Do not use asterisks (*). \n\nReport:\n" . $textToAnalyze;

        // 4. Call Google Gemini API
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";

        try {
            $response = Http::withOptions(['verify' => false])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->failed()) {
                Log::error("❌ Google API Error: " . $response->body());
                return response()->json([
                    'message' => 'AI Provider Refused Connection', 
                    'details' => $response->json()
                ], 500);
            }

            $data = $response->json();

            // 5. Extract Summary
            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                $summary = $data['candidates'][0]['content']['parts'][0]['text'];
                
                return response()->json([
                    'status' => 'success',
                    'summary' => $summary
                ]);
            } else {
                Log::error("❌ Invalid AI Response Format: " . json_encode($data));
                return response()->json(['message' => 'AI generated an empty response'], 500);
            }

        } catch (\Exception $e) {
            Log::error("❌ Summarize Controller Crash: " . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error: ' . $e->getMessage()], 500);
        }
    }
}