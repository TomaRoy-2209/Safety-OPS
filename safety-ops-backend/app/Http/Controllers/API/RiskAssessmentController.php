<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Incident;
use Carbon\Carbon;

class RiskAssessmentController extends Controller
{
    public function getRiskAnalysis()
    {
        // 1. Define Strategic Zones (Dhaka Key Areas)
        $zones = [
            ['name' => 'Gulshan / Banani', 'lat' => 23.7925, 'lng' => 90.4078, 'radius' => 0.02],
            ['name' => 'Mirpur', 'lat' => 23.8223, 'lng' => 90.3654, 'radius' => 0.03],
            ['name' => 'Dhanmondi', 'lat' => 23.7461, 'lng' => 90.3742, 'radius' => 0.02],
            ['name' => 'Old Dhaka', 'lat' => 23.7104, 'lng' => 90.4074, 'radius' => 0.025],
            ['name' => 'Uttara', 'lat' => 23.8728, 'lng' => 90.3968, 'radius' => 0.03],
            ['name' => 'Motijheel / Paltan', 'lat' => 23.7330, 'lng' => 90.4172, 'radius' => 0.015],
            ['name' => 'Bashundhara', 'lat' => 23.8191, 'lng' => 90.4526, 'radius' => 0.02],
        ];

        $results = [];

        foreach ($zones as $zone) {
            // 2. Fetch Incidents inside this zone
            $incidents = Incident::whereBetween('latitude', [$zone['lat'] - $zone['radius'], $zone['lat'] + $zone['radius']])
                                 ->whereBetween('longitude', [$zone['lng'] - $zone['radius'], $zone['lng'] + $zone['radius']])
                                 ->get();

            // 3. THE RISK ALGORITHM
            $total = $incidents->count();
            
            // Factor A: Recency (Last 7 days count double)
            $recent = $incidents->filter(function ($i) {
                return $i->created_at > Carbon::now()->subDays(7);
            })->count();

            // Factor B: Severity (Active threats count 1.5x)
            $active = $incidents->whereIn('status', ['pending', 'dispatched'])->count();

            // Calculate & Normalize Score (0-100)
            $rawScore = ($total * 1) + ($recent * 5) + ($active * 3);
            $score = min(100, ceil(($rawScore / 50) * 100));

            // Determine Label
            $level = 'LOW';
            if ($score > 30) $level = 'MODERATE';
            if ($score > 60) $level = 'HIGH';
            if ($score > 85) $level = 'CRITICAL';

            $results[] = [
                'zone' => $zone['name'],
                'stats' => [
                    'total_incidents' => $total,
                    'recent_surge' => $recent,
                    'active_threats' => $active
                ],
                'risk_score' => $score,
                'risk_level' => $level,
                'prediction' => $this->generatePrediction($level)
            ];
        }

        // Sort by highest risk first
        usort($results, function ($a, $b) {
            return $b['risk_score'] <=> $a['risk_score'];
        });

        return response()->json($results);
    }

    private function generatePrediction($level)
    {
        if ($level === 'CRITICAL') return "High probability of immediate recurrence. Deploy units.";
        if ($level === 'HIGH') return "Escalating trend detected. Increased patrol recommended.";
        if ($level === 'MODERATE') return "Baseline activity normal. Standard monitoring.";
        return "Stable. No significant anomalies predicted.";
    }
}

