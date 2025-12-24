<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\IncidentController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\RiskAssessmentController;
use App\Http\Controllers\API\SummarizeController;

// --- 1. PUBLIC ROUTES (No Login Required) ---
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Map Data
Route::get('/incidents/all', [IncidentController::class, 'getAll']);

// --- 2. PROTECTED ROUTES (Login Required) ---
Route::middleware('auth:api')->group(function () {

    // --- Auth Management ---
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('profile', [AuthController::class, 'profile']);
        Route::post('/fcm-token', [AuthController::class, 'updateFcmToken']);
        
        // --- TARIN'S FEATURE: RISK SCORING ---
        Route::get('/analytics/risk-assessment', [RiskAssessmentController::class, 'getRiskAnalysis']);
    });

    // --- CHAT & REPORTS ---
    Route::get('/chat/{incidentId}', [ChatController::class, 'index']);
    Route::post('/chat/{incidentId}', [ChatController::class, 'send']);
    Route::get('/reports/generate', [ReportController::class, 'generate']);

    // --- CITIZEN FEATURES ---
    Route::post('/incidents', [IncidentController::class, 'store']);
    Route::post('/incidents/{id}/upload', [IncidentController::class, 'uploadEvidence']);
    Route::get('/my-reports', [IncidentController::class, 'myReports']);

    // --- RESPONDER / ADMIN FEATURES ---
    Route::get('/incidents', [IncidentController::class, 'index']);

    // --- ADMIN ONLY CONTROLS ---
    Route::post('/incidents/{id}/assign', [IncidentController::class, 'assign']);

    // --- DISASTER MODE (From Incoming Merge) ---
    Route::post('/admin/disaster-mode', [AdminController::class, 'triggerDisasterMode']);
    
    // --- USER MANAGEMENT ---
    Route::get('/admin/users', [AdminController::class, 'index']);
    Route::put('/admin/users/{id}/role', [AdminController::class, 'updateRole']);
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    
    // --- TOMA'S AI FEATURE (Your New Feature) ---
    Route::post('/incidents/{id}/summarize', [SummarizeController::class, 'generateSummary']);

});