<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SMSService
{
    public static function send($to, $message)
    {
        // 1. Get API Key from .env
        $apiKey = env('SMS_API_KEY');
        
        if (!$apiKey) {
            Log::warning("SMS Skipped: SMS_API_KEY missing in .env");
            return false;
        }

        // 2. Format Phone Number (Must start with 88)
        // Removes existing + or 88, then adds 88 back strictly.
        $cleanNumber = preg_replace('/^(\+88|88)/', '', $to); 
        $finalNumber = '88' . $cleanNumber;

        try {
            $response = Http::get('https://api.sms.net.bd/sendsms', [
                'api_key' => $apiKey,
                'msg'     => $message,
                'to'      => $finalNumber
            ]);

            $responseData = $response->json(); // Convert JSON to Array

            // Check if HTTP was 200 OK AND if the API says "error: 0" (0 means success)
            if ($response->successful() && isset($responseData['error']) && $responseData['error'] == 0) {
                Log::info("✅ SMS Sent to {$finalNumber}");
                return true;
            } else {
                // Now it will correctly log the error (e.g., Insufficient Balance)
                Log::error("❌ SMS Failed: " . ($responseData['msg'] ?? 'Unknown Error'));
                return false;
            }

        } catch (\Exception $e) {
            Log::error("❌ SMS Connection Failed: " . $e->getMessage());
            return false;
        }
    }
}


