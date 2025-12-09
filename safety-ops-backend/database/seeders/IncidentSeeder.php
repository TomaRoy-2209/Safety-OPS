<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Incident;

class IncidentSeeder extends Seeder
{
    public function run()
    {
        // Create Fake Incident 1
        Incident::create([
            'title' => 'Fire at Gulshan 1',
            'description' => 'Large fire seen on the 3rd floor of the Glass Building.',
            'status' => 'pending',
            'latitude' => 23.7925,
            'longitude' => 90.4078,
            'user_id' => 1
        ]);
        
        // Create Fake Incident 2
        Incident::create([
            'title' => 'Pothole on Road 5',
            'description' => 'Car got stuck, need assistance immediately.',
            'status' => 'resolved',
            'latitude' => 23.8625,
            'longitude' => 90.3078,
            'user_id' => 1
        ]);
    }
}
