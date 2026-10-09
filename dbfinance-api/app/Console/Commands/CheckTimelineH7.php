<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ProjectTimeline;
use App\Models\User;
use App\Notifications\ProjectTimelineReminder;
use App\Services\WhatsAppService;
use Carbon\Carbon;

class CheckTimelineH7 extends Command
{
    protected $signature = 'timeline:check-h7';
    protected $description = 'Cek tahapan project yang mendekati jatuh tempo (H-7 s/d tenggat) dan kirim reminder WhatsApp otomatis setiap hari';

    public function handle(WhatsAppService $whatsapp)
    {
        // Rentang hari ini s/d H-7 (tenggat yang berada maksimal 7 hari ke depan)
        $today = Carbon::now()->startOfDay();
        $todayString = $today->toDateString();
        $h7Date = $today->copy()->addDays(7)->toDateString();

        // Cari timeline yang end_date nya dalam rentang hari ini s/d H-7 dan belum selesai
        $timelines = ProjectTimeline::with('project')
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [$todayString, $h7Date])
            ->whereIn('status', ['pending', 'in_progress'])
            ->get();

        $users = User::all(); // Kirim notifikasi in-app ke seluruh user / admin
        $sent = 0;

        foreach ($timelines as $timeline) {
            // Kirim reminder WA & notifikasi in-app sekali per hari per tahapan
            // (berulang setiap hari sejak H-7 sampai tenggat, selama belum selesai)
            if (is_null($timeline->wa_sent_at) || !$timeline->wa_sent_at->isSameDay($today)) {
                foreach ($users as $user) {
                    $user->notify(new ProjectTimelineReminder($timeline));
                }

                $daysLeft = (int) $today->diffInDays(Carbon::parse($timeline->end_date)->startOfDay());

                if ($whatsapp->send($this->buildMessage($timeline, $daysLeft))) {
                    $timeline->update(['wa_sent_at' => Carbon::now()]);
                    $sent++;
                }
            }
        }

        $this->info("Berhasil memeriksa " . $timelines->count() . " tahapan mendekati tenggat, {$sent} reminder WhatsApp terkirim.");
    }

    private function buildMessage(ProjectTimeline $timeline, int $daysLeft): string
    {
        $projectName = $timeline->project->project_name ?? 'Project';
        $statusLabel = match ($timeline->status) {
            'in_progress' => 'Berjalan',
            'delayed' => 'Tertunda',
            default => 'Pending',
        };

        $urgency = $daysLeft === 0
            ? 'berakhir HARI INI'
            : "akan berakhir dalam {$daysLeft} hari lagi";

        $lines = [
            '*REMINDER TIMELINE PROJECT*',
            '',
            "Tahapan *{$timeline->step_name}* pada project *{$projectName}* {$urgency}.",
            '',
            "Nama Tahapan : {$timeline->step_name}",
            "Tenggat      : {$timeline->end_date}",
            "Status       : {$statusLabel}",
            '',
            'Mohon segera ditindaklanjuti. Terima kasih.',
        ];

        return implode("\n", $lines);
    }
}
