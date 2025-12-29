<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan; // 👈 ADDED THIS IMPORT
use App\Services\FCMService; 

Route::get('/test-fcm', function () {
    // 1. Find a real user who has a token
    $user = \App\Models\User::whereNotNull('fcm_token')->first();

    if (!$user) {
        return "<h3>❌ No users found with tokens.</h3> <p>Please log in to the Citizen Dashboard on your phone/PC to generate a token first.</p>";
    }

    echo "<h3>📡 Testing Live Notification</h3>";
    echo "<strong>Target User:</strong> {$user->name} <br>";
    echo "<strong>Token:</strong> " . substr($user->fcm_token, 0, 15) . "... <br><br>";

    // 2. Validate the JSON file content
    $path = storage_path('app/firebase_credentials.json');
    $content = file_get_contents($path);
    $json = json_decode($content, true);

    if (json_last_error() !== JSON_ERROR_NONE || !isset($json['project_id'])) {
        return "<h3 style='color:red'>❌ JSON Error</h3> <p>The file was found but is corrupted or empty. Did you copy the text correctly?</p>";
    }
    
    echo "<strong>Project ID:</strong> " . $json['project_id'] . " (File is valid) <br><br>";

    // 3. Send Real Test
    echo "<strong>Sending...</strong><br>";
    
    $success = \App\Services\FCMService::send(
        $user->fcm_token, 
        "SYSTEM TEST 🚀", 
        "If you read this, the Live Server is FULLY OPERATIONAL!"
    );

    if ($success) {
        return "<h1 style='color:green'>✅ SUCCESS!</h1> <p>Notification sent successfully. Check your device.</p>";
    } else {
        return "<h1 style='color:red'>❌ FAILED (API Error)</h1> <p>The file is good, but Google rejected the request. Check if the 'Firebase Cloud Messaging API (V1)' is enabled in Google Console.</p>";
    }
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

Route::get('/fix-server', function () {
    // 1. Clear the Config Cache (This fixes CORS)
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    
    // 2. Run Migrations (Just in case)
    Artisan::call('migrate', ['--force' => true]);
    
    // 3. Clear other caches
    Artisan::call('cache:clear');
    Artisan::call('view:clear');

    return "✅ Server Fixed! Config cleared, Routes cleared, Migrations run.";
}); // 👈 ADDED THE MISSING SEMICOLON HERE