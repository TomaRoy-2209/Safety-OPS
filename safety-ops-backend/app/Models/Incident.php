<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    use HasFactory;

    // This part is MISSING in your code right now.
    // It tells Laravel: "It is safe to save these fields."
    protected $fillable = [
        'title',
        'description',
        'latitude',
        'longitude',
        'status',
        'user_id',
        'assigned_agency',
    ];
}
