<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'step_name',
        'description',
        'start_date',
        'end_date',
        'status',
        'wa_sent_at',
    ];

    protected $casts = [
        'wa_sent_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}