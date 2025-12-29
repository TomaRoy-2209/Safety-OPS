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

        $fileName = 'firebase_credentials.json';

        // 🔍 CHECK 1: Storage Folder (Where you put it)
        $credentialsPath = storage_path("app/$fileName");

        // 🔍 CHECK 2: Root Directory (Fallback)
        if (!file_exists($credentialsPath)) {
            $credentialsPath = base_path($fileName);
        }

        // 🔍 CHECK 3: Public Folder (Last Resort)
        if (!file_exists($credentialsPath)) {
            $credentialsPath = public_path($fileName);
        }

        // ❌ IF STILL NOT FOUND
        if (!file_exists($credentialsPath)) {
            Log::error("❌ FCM CRITICAL: firebase_credentials.json NOT FOUND in Storage, Root, or Public.");
            return false;
        }

        try {
            // 1. Authenticate
            $json = json_decode(file_get_contents($credentialsPath), true);
            $projectId = $json['project_id'];

            $credentials = new ServiceAccountCredentials(
                ['https://www.googleapis.com/auth/firebase.messaging'],
                $credentialsPath
            );
            $accessToken = $credentials->fetchAuthToken()['access_token'];

            // 2. Prepare Payload
            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

            $data = [
                "message" => [
                    "token" => $token,
                    "notification" => [
                        "title" => $title,
                        "body" => $body
                    ],
                    "webpush" => [
                        "headers" => ["Urgency" => "high"],
                        "notification" => ["requireInteraction" => true]
                    ]
                ]
            ];

            // 3. Send
            $response = Http::withToken($accessToken)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $data);

            if ($response->successful()) {
                Log::info("✅ FCM Sent: " . $response->body());
                return true;
            } else {
                Log::error("❌ FCM Failed: " . $response->body());
                return false;
            }

        } catch (\Exception $e) {
            Log::error("❌ FCM Exception: " . $e->getMessage());
            return false;
        }
    }
}