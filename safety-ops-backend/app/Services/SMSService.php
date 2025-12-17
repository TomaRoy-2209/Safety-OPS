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
            // 3. Send Request to sms.net.bd (or your specific gateway)
            // Note: If using a different provider, change this URL.
            $response = Http::get('https://api.sms.net.bd/sendsms', [
                'api_key' => $apiKey,
                'msg'     => $message,
                'to'      => $finalNumber
            ]);

            if ($response->successful()) {
                Log::info("✅ SMS Sent to {$finalNumber}");
                return true;
            } else {
                Log::error("❌ SMS Gateway Error: " . $response->body());
                return false;
            }

        } catch (\Exception $e) {
            Log::error("❌ SMS Connection Failed: " . $e->getMessage());
            return false;
        }
    }
}


