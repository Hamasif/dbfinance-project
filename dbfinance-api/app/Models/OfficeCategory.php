<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeCategory extends Model
{
    public function transactions() {
    return $this->hasMany(Transaction::class, 'project_id');
}
}
