<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Incident;
use App\Models\User;

class IncidentSeeder extends Seeder
{
    public function run()
    {
        // 1. Just FIND the user created by DatabaseSeeder
        $user = User::find(1); 

        // Safety check: If DatabaseSeeder didn't run, create a fallback user
        if (!$user) {
             $user = User::create([
                'id' => 1,
                'name' => 'Fallback User',
                'email' => 'fallback@example.com',
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
             ]);
        }

        // 2. Create Incidents linked to that User
        Incident::create([
            'title' => 'Fire at Gulshan 1',
            'description' => 'Large fire seen on the 3rd floor.',
            'status' => 'pending',
            'latitude' => 23.7925,
            'longitude' => 90.4078,
            'user_id' => $user->id, 
        ]);

        Incident::create([
            'title' => 'Pothole on Road 5',
            'description' => 'Car got stuck.',
            'status' => 'pending',
            'latitude' => 23.8625,
            'longitude' => 90.3078,
            'user_id' => $user->id,
        ]);
    }
}


