<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    
    use HasFactory;
     protected $fillable = [
        'title',
        'description',
        'latitude',
        'longitude',
        'status',
        'user_id',
    ];

}
