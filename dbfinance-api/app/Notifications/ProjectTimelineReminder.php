<?php

namespace App\Notifications;

use App\Models\ProjectTimeline;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectTimelineReminder extends Notification
{
    use Queueable;

    public $timeline;

    public function __construct(ProjectTimeline $timeline)
    {
        $this->timeline = $timeline;
    }

    public function via($notifiable)
    {
        return ['database']; // Menyimpan notifikasi ke dalam tabel database MySQL
    }

    public function toArray($notifiable)
    {
        return [
            'timeline_id' => $this->timeline->id,
            'step_name'   => $this->timeline->step_name,
            'project_name'=> $this->timeline->project->project_name ?? 'Project',
            'start_date'  => $this->timeline->start_date,
            'message'     => "Tahapan '{$this->timeline->step_name}' akan dimulai dalam 7 hari lagi ({$this->timeline->start_date})."
        ];
    }
}