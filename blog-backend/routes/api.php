<?php

use App\Services\QuoteService;
use Illuminate\Support\Facades\Route;

Route::get('/quote', fn(QuoteService $s) => response()->json($s->quoteOfTheDay()));
