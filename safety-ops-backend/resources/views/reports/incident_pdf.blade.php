<!DOCTYPE html>
<html>
<head>
    <title>Incident Report</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #444; padding-bottom: 10px; }
        h1 { margin: 0; color: #d32f2f; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        .badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 10px; }
        .pending { background-color: #d32f2f; }
        .dispatched { background-color: #1976d2; }
        .resolved { background-color: #388e3c; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SafetyOps Official Report</h1>
        <p>Generated: {{ date('F d, Y') }} | Period: Last {{ $days }} Days</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Incident Title</th>
                <th>Date Reported</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($incidents as $inc)
            <tr>
                <td>#{{ $inc->id }}</td>
                <td>{{ $inc->title }}</td>
                <td>{{ $inc->created_at->format('M d, Y H:i') }}</td>
                <td>
                    <span class="badge {{ $inc->status }}">
                        {{ strtoupper($inc->status) }}
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
