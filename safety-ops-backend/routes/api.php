<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\IncidentController;
use App\Http\Controllers\API\AdminController;

// --- Auth Routes (Toma) ---
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('profile', [AuthController::class, 'profile']);
    });
});

// --- Module 1 & 2 Feature Routes ---

// 1. [Sabrina] Report Incident
Route::post('/incidents', [IncidentController::class, 'store']);

// 2. [Ifrad] Upload Evidence
Route::post('/incidents/{id}/upload', [IncidentController::class, 'uploadEvidence']);

// 3. [Tarin] My Reports Dashboard
Route::get('/my-reports', [IncidentController::class, 'index']);

// 4. [Toma] Assign Incident
Route::post('/incidents/{id}/assign', [IncidentController::class, 'assign']);

// --- Sabrina's Admin Features ---
Route::get('/admin/users', [AdminController::class, 'index']);
Route::put('/admin/users/{id}/role', [AdminController::class, 'updateRole']);
