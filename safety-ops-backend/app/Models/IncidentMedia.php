<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class IncidentMedia extends Model
{
    use HasFactory;


    // We explicitly tell Laravel which table to use
    protected $table = 'incident_media';


    // Allow these fields to be saved
    protected $fillable = [
        'incident_id',
        'file_path',
        'file_type'
    ];


    public function incident()
    {
        return $this->belongsTo(Incident::class);
    }
}
