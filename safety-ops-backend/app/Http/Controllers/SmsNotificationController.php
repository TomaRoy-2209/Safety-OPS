<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SmsNotificationController extends Controller {
    public function notifyResponders(Request $request) {
        $request->validate([
            'number' => 'required|string', // Must use full BD number, e.g., 017XXXXXXXX
            'message' => 'required|string',
        ]);

        $apiKey = env('SMS_NET_BD_API_KEY');
        $number = $request->number;
        // Accept both with or without country code
        if (strpos($number, '880') !== 0) {
            $number = '880' . ltrim($number, '0');
        }
        $url = "https://api.sms.net.bd/sendsms";
        $params = [
            'api_key' => $apiKey,
            'msg' => $request->message,
            'to' => $number
        ];

        try {
            $response = Http::get($url, $params);
            $respData = $response->json();
            // If you want, you can also log $respData or handle delivery codes
            return response()->json($respData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
