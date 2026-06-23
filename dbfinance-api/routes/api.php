<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\OfficeCategoryController;
use App\Http\Controllers\Api\NeracaController;

// Project
Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
Route::get('/reports/projects', [ProjectController::class, 'report']);
Route::get('/reports/laba-rugi', [ProjectController::class, 'labaRugi']);

// Detail Project
Route::get('/projects/{projectId}/transactions', [TransactionController::class, 'getByProject']);
Route::post('/transactions', [TransactionController::class, 'store']);
Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);

// Pengeluaran Kantor
Route::get('/office-categories', [OfficeCategoryController::class, 'index']);
Route::post('/office-categories', [OfficeCategoryController::class, 'store']);
Route::delete('/office-categories/{id}', [OfficeCategoryController::class, 'destroy']);
Route::get('/office-expenses', [TransactionController::class, 'getOfficeExpenses']);
Route::get('/reports/office', [OfficeCategoryController::class, 'report']);

// Neraca
Route::get('/neraca-settings', [NeracaController::class, 'index']);
Route::post('/neraca-settings', [NeracaController::class, 'update']);