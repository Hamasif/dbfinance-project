<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficeCategory extends Model
{
    protected $fillable = [
        'category_name',
        'person_in_charge',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'project_id');
    }
}