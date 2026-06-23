<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    public function project() {
    return $this->belongsTo(Project::class, 'project_id');
}
}
