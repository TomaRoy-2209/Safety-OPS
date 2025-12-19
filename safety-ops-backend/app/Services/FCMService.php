<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Google\Auth\Credentials\ServiceAccountCredentials;

class FCMService
{
    public static function send($token, $title, $body)
    {
        if (!$token) return;

        // 1. Get the Project ID from the JSON file
        $credentialsPath = storage_path('app/firebase_credentials.json');
        
        if (!file_exists($credentialsPath)) {
            Log::error("FCM Error: firebase_credentials.json not found in storage/app/");
            return false;
        }

        $json = json_decode(file_get_contents($credentialsPath), true);
        $projectId = $json['project_id'];

        // 2. Generate an Access Token using Google Auth
        $credentials = new ServiceAccountCredentials(
            ['https://www.googleapis.com/auth/firebase.messaging'],
            $credentialsPath
        );
        $accessToken = $credentials->fetchAuthToken()['access_token'];

        // 3. Send the request to the NEW HTTP v1 Endpoint
        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        $data = [
            "message" => [
                "token" => $token,
                "notification" => [
                    "title" => $title,
                    "body" => $body
                ]
            ]
        ];

        try {
            $response = Http::withToken($accessToken) // Use the generated token
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $data);

            Log::info("FCM Response: " . $response->body());
            return $response->successful();
        } catch (\Exception $e) {
            Log::error("FCM Error: " . $e->getMessage());
            return false;
        }
    }
}