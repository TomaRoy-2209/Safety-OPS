<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\IncidentController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\ChatController; // <--- ADD THIS LINE
use App\Http\Controllers\API\ReportController;

// --- 1. PUBLIC ROUTES (No Login Required) ---
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Map Data (Publicly accessible for the landing page map)
Route::get('/incidents/all', [IncidentController::class, 'getAll']);


// --- 2. PROTECTED ROUTES (Login Required) ---
// Everything inside here requires a valid Token (JWT)
Route::middleware('auth:api')->group(function () {

    // --- Auth Management ---
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('profile', [AuthController::class, 'profile']);
        // Inside auth:api group
       

    });
    Route::get('/chat/{incidentId}', [ChatController::class, 'index']);
    Route::post('/chat/{incidentId}', [ChatController::class, 'send']);
    Route::get('/reports/generate', [ReportController::class, 'generate']);

    // --- CITIZEN FEATURES ---
    // Create a new report
    Route::post('/incidents', [IncidentController::class, 'store']);
    // Upload evidence to a specific report
    Route::post('/incidents/{id}/upload', [IncidentController::class, 'uploadEvidence']);
    // View ONLY my own reports (Uses 'myReports' method we created)
    Route::get('/my-reports', [IncidentController::class, 'myReports']);


    // --- RESPONDER / ADMIN FEATURES (Live Feed) ---
    // View ALL reports with Evidence (Uses 'index' method)
    Route::get('/incidents', [IncidentController::class, 'index']);


    // --- ADMIN ONLY CONTROLS ---
    // Dispatch/Assign a unit
    Route::post('/incidents/{id}/assign', [IncidentController::class, 'assign']);
    
    // User Management
    Route::get('/admin/users', [AdminController::class, 'index']);
    Route::put('/admin/users/{id}/role', [AdminController::class, 'updateRole']);
    // Inside middleware('auth:api') group:
    Route::post('/admin/users', [AdminController::class, 'createUser']);
});