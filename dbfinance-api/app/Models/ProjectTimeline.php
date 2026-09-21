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
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}