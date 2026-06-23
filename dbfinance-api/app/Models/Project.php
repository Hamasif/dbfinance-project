<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['project_name', 'project_amount', 'person_in_charge', 'tax_rate_percent', 'tax_value_deduction', 'project_raw_amount'];

    // Relasi ke tabel transaksi
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'project_id');
    }
}