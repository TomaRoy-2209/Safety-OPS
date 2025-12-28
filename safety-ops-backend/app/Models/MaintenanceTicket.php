<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceTicket extends Model
{
    use HasFactory;

    // ✅ ADD 'image_path' HERE
    protected $fillable = [
        'user_id', 
        'title', 
        'description', 
        'category', 
        'latitude', 
        'longitude', 
        'status',
        'image_path' 
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}