<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    use HasFactory;

    protected $guarded = [];

    // --- ADD THIS FUNCTION ---
    public function evidence()
    {
        return $this->hasMany(IncidentMedia::class);
    }
}