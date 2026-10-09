<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Reminder H-7 timeline project: cek tiap jam, kirim WA otomatis sekali per hari per tahapan
// (berulang setiap hari sejak H-7 sampai hari tenggat, selama belum selesai)
Schedule::command('timeline:check-h7')->hourly();
