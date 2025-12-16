<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Incident;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function generate(Request $request)
    {
        // Validate Inputs
        $request->validate([
            'type' => 'required|in:pdf,csv', 
            'days' => 'required|integer'
        ]);

        // Fetch Data
        $startDate = Carbon::now()->subDays($request->days);
        $incidents = Incident::where('created_at', '>=', $startDate)
                             ->orderBy('created_at', 'desc')
                             ->get();

        if ($incidents->isEmpty()) {
            return response()->json(['message' => 'No data found for this period'], 404);
        }

        // Export Based on Type
        if ($request->type === 'csv') {
            return $this->exportCSV($incidents);
        } else {
            return $this->exportPDF($incidents, $request->days);
        }
    }

    private function exportCSV($incidents)
    {
        $filename = "safety_report_" . date('Y-m-d') . ".csv";
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Expires" => "0"
        ];

        $callback = function() use ($incidents) {
            $file = fopen('php://output', 'w');
            // CSV Headers
            fputcsv($file, ['ID', 'Title', 'Status', 'Date', 'Location (Lat,Lng)']);

            foreach ($incidents as $incident) {
                fputcsv($file, [
                    $incident->id,
                    $incident->title,
                    $incident->status,
                    $incident->created_at->format('Y-m-d H:i'),
                    $incident->latitude . ',' . $incident->longitude
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportPDF($incidents, $days)
    {
        $data = ['incidents' => $incidents, 'days' => $days];
        // Load the view (we will create this next)
        $pdf = Pdf::loadView('reports.incident_pdf', $data);
        return $pdf->download('incident_report.pdf');
    }
}
