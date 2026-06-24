<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'project_id',
        'type',
        'description',
        'amount',
        'date',
        'category',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}