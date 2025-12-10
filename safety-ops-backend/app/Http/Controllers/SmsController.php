<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Twilio\Rest\Client;
use exception;
class SmsController extends Controller {
    public function sendSms() {
        $receiverNumber = '+8801623517002'; // <-- use your real recipient number
        $message = 'Hi! Test SMS from Laravel.';
        $sid    = env('TWILIO_SID');
        $token  = env('TWILIO_TOKEN');
        $from   = env('TWILIO_FROM');
        try {
            $client = new Client($sid, $token);
            $client->messages->create($receiverNumber, [
                'from' => $from,
                'body' => $message
            ]);
            return 'SMS sent successfully!';
        } catch (\Exception $e) {
            return 'Error: ' . $e->getMessage();
        }
    }
}





