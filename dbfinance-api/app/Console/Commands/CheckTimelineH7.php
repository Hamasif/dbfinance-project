<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProjectTimeline;
use App\Models\User;
use App\Notifications\ProjectTimelineReminder;
use Carbon\Carbon;

class CheckTimelineH7 extends Command
{
    protected $signature = 'timeline:check-h7';
    protected $description = 'Cek tahapan project yang akan jatuh tempo dalam 7 hari kedepan';

    public function handle()
    {
        // Ambil tanggal 7 hari dari sekarang
        $targetDate = Carbon::now()->addDays(7)->toDateString();

        // Cari timeline yang end_date nya pas H-7 (jatuh tempo 7 hari lagi) dan belum selesai
        $timelines = ProjectTimeline::whereNotNull('end_date')
            ->whereDate('end_date', $targetDate)
            ->whereIn('status', ['pending', 'in_progress'])
            ->get();

        $users = User::all(); // Kirim ke seluruh user / admin

        foreach ($timelines as $timeline) {
            foreach ($users as $user) {
                $user->notify(new ProjectTimelineReminder($timeline));
            }
        }

        $this->info("Berhasil memeriksa " . $timelines->count() . " tahapan H-7.");
    }
}