<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ParkingSpotController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/parking-spots', [ParkingSpotController::class, 'index']);
    Route::get('/parking-spots/{parkingSpot}', [ParkingSpotController::class, 'show']);

    Route::middleware('role:owner')->group(function () {
        Route::get('/owner/dashboard', [DashboardController::class, 'owner']);
        Route::get('/owner/parking-spots', [ParkingSpotController::class, 'ownerIndex']);
        Route::post('/parking-spots', [ParkingSpotController::class, 'store']);
        Route::put('/parking-spots/{parkingSpot}', [ParkingSpotController::class, 'update']);
        Route::delete('/parking-spots/{parkingSpot}', [ParkingSpotController::class, 'destroy']);
        Route::delete('/parking-images/{image}', [ParkingSpotController::class, 'destroyImage']);
        Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
        Route::post('/owner/scan-qr', [BookingController::class, 'scanQr']);
        Route::post('/bookings/{booking}/confirm-cash', [BookingController::class, 'confirmCash']);
    });

    Route::middleware('role:driver')->group(function () {
        Route::get('/driver/dashboard', [DashboardController::class, 'driver']);
        Route::apiResource('/cars', CarController::class)->except(['show']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::post('/bookings/{booking}/payment', [BookingController::class, 'pay']);
        Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    });

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
});
