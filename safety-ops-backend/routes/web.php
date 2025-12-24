<?php

use Illuminate\Support\Facades\Route;
use App\Services\FCMService; // Make sure this path matches where she put the file

Route::get('/test-fcm', function () {
    // 1. PASTE THE TOKEN FROM STEP 1 HERE
    $myDeviceToken = "PASTE_THE_LONG_STRING_HERE";

    // 2. Send the Test
    $success = FCMService::send(
        $myDeviceToken, 
        "Sabrina's Test", 
        "If you see this, the Firebase Pipe is working! 🚀"
    );

    return $success ? "✅ Push Sent Successfully!" : "❌ Push Failed. Check Laravel Logs.";
});

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
