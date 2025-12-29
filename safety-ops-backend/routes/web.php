<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan; // 👈 ADDED THIS IMPORT
use App\Services\FCMService; 

Route::get('/test-fcm', function () {
    $token = "YOUR_TEST_TOKEN_HERE"; // Optional, or leave blank to just test file access

    // 1. Debug File Paths
    $storagePath = storage_path('app/firebase_credentials.json');
    $publicPath = public_path('firebase_credentials.json');
    $basePath = base_path('firebase_credentials.json');

    echo "<h3>🔍 FCM Debugger</h3>";
    
    echo "<strong>Checking Storage:</strong> $storagePath <br>";
    echo "Result: " . (file_exists($storagePath) ? '✅ FOUND' : '❌ NOT FOUND') . "<br><br>";

    echo "<strong>Checking Public:</strong> $publicPath <br>";
    echo "Result: " . (file_exists($publicPath) ? '✅ FOUND' : '❌ NOT FOUND') . "<br><br>";

    echo "<strong>Checking Root:</strong> $basePath <br>";
    echo "Result: " . (file_exists($basePath) ? '✅ FOUND' : '❌ NOT FOUND') . "<br><br>";

    // 2. Debug Google Library
    echo "<strong>Checking Google Auth Library:</strong> ";
    if (class_exists('Google\Auth\Credentials\ServiceAccountCredentials')) {
        echo "✅ INSTALLED <br><br>";
    } else {
        echo "❌ MISSING (Run 'composer require google/auth') <br><br>";
        return;
    }

    // 3. Try to Send
    echo "<strong>Attempting to Send...</strong><br>";
    try {
        $success = \App\Services\FCMService::send(
            $token, 
            "Debug Test", 
            "Testing connection..."
        );
        
        if ($success) {
            echo "<h3 style='color:green'>🎉 SUCCESS! Notification Sent.</h3>";
        } else {
            echo "<h3 style='color:red'>❌ FAILED. (See above for missing file)</h3>";
        }
    } catch (\Exception $e) {
        echo "<h3 style='color:red'>❌ CRITICAL ERROR:</h3>";
        echo $e->getMessage();
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