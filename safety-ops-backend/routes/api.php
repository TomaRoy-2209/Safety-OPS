<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\IncidentController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:api')->post('refresh', [AuthController::class, 'refresh']);



    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('profile', [AuthController::class, 'profile']);
    });
});

Route::post('/incidents/{id}/upload', [IncidentController::class, 'uploadEvidence']);
Route::get('/my-reports', [IncidentController::class, 'index']);