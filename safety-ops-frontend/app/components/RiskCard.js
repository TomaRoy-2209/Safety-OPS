export default function RiskCard({ data }) {
    const getColor = (level) => {
        if (level === 'CRITICAL') return 'border-red-600 bg-red-900/10 text-red-500';
        if (level === 'HIGH') return 'border-orange-500 bg-orange-900/10 text-orange-400';
        if (level === 'MODERATE') return 'border-yellow-500 bg-yellow-900/10 text-yellow-400';
        return 'border-green-600 bg-green-900/10 text-green-500';
    };

    const colorClass = getColor(data.risk_level);

    return (
        <div className={`border rounded-xl p-5 relative overflow-hidden transition-all hover:scale-[1.02] ${colorClass.split(' ')[0]} bg-[#0a0a0a]`}>
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 p-16 opacity-10 rounded-full blur-2xl -mr-10 -mt-10 ${colorClass.split(' ')[1].replace('/10', '')}`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white">{data.zone}</h3>
                    <div className="text-sm text-gray-400">
                        AI Confidence: <span className="text-green-400">{data.ai_confidence}%</span>
                    </div>
                </div>
                <div className={`text-center px-3 py-1 rounded border ${colorClass}`}>
                    <div className="text-2xl font-bold">{data.risk_score}</div>
                    <div className="text-[10px] font-bold uppercase">Risk Index</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase">History</div>
                    <div className="text-white font-mono font-bold">{data.stats.total_incidents}</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase">7-Day Surge</div>
                    <div className="text-white font-mono font-bold">{data.stats.recent_surge > 0 ? `+${data.stats.recent_surge}` : '0'}</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-gray-800">
                    <div className="text-gray-400 text-[10px] uppercase">Active</div>
                    <div className="text-white font-mono font-bold">{data.stats.active_threats}</div>
                </div>
            </div>

            {/* Prediction Text */}
            <div className="relative z-10 pt-3 border-t border-gray-800/50">
                <p className={`text-xs font-mono ${colorClass.split(' ')[2]}`}>
                    <span className="font-bold">PREDICTION:</span> {data.prediction}
                </p>
            </div>
        </div>
    );
}
