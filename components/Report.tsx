import React from 'react';
import { UserProgress } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { ArrowLeft } from 'lucide-react';

interface ReportProps {
    progress: UserProgress;
    onBack: () => void;
}

const Report: React.FC<ReportProps> = ({ progress, onBack }) => {
    // Determine data source: use history, or fallback to current day if history is empty/missing
    const historyData = progress.history && progress.history.length > 0 
        ? progress.history 
        : [{ 
            date: progress.dailyProgress.date, 
            studyCount: progress.dailyProgress.count,
            quizCorrect: 0,
            quizTotal: 0,
            sessions: []
          }];

    // State for expanded detail view
    const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

    // Process data for charts
    // Chart 1: Daily Study Cards (Bar Chart)
    const studyData = historyData.map(d => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: d.date,
        count: d.studyCount
    })).slice(-14); // Last 14 days

    // Chart 2: Identification Score (Line Chart)
    const scoreData = historyData.map(d => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: d.date,
        score: d.quizTotal > 0 ? Math.round((d.quizCorrect / d.quizTotal) * 100) : 0,
        sessions: d.sessions
    })).slice(-14);

    const handleDotClick = (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const payload = data.activePayload[0].payload;
            setSelectedDate(selectedDate === payload.fullDate ? null : payload.fullDate);
        }
    };
    
    // Find sessions for selected date
    const selectedSessionData = selectedDate ? historyData.find(h => h.date === selectedDate)?.sessions : null;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded shadow-sm text-xs">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{label}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {payload[0].name}: <span className="text-zinc-900 dark:text-zinc-50 font-medium">{payload[0].value}</span>
                        {payload[0].unit}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">Click to view details</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-50">Status Report</h2>
            </div>

            <div className="space-y-8 overflow-y-auto pb-8 pr-2">
                
                {/* Chart 1: Daily Study Cards */}
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                        Daily Study Cards
                        <span className="text-xs font-normal text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Last 14 Days</span>
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studyData}>
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 10, fill: '#71717a'}} 
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                <Bar 
                                    dataKey="count" 
                                    name="Cards Learned"
                                    fill="currentColor" 
                                    className="fill-zinc-900 dark:fill-zinc-50"
                                    radius={[4, 4, 4, 4]} 
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Identification Score */}
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 transition-all duration-300">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
                        Identification Score
                        <span className="text-xs font-normal text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Day Wise</span>
                    </h3>
                    
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={scoreData} onClick={handleDotClick}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.1} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 10, fill: '#71717a'}} 
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    hide
                                    domain={[0, 100]} 
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#71717a', strokeWidth: 1, strokeDasharray: '4 4'}} />
                                <Line 
                                    type="monotone" 
                                    dataKey="score" 
                                    name="Accuracy"
                                    unit="%"
                                    stroke="currentColor" 
                                    className="stroke-zinc-900 dark:stroke-zinc-50"
                                    strokeWidth={2}
                                    dot={{fill: 'currentColor', r: 4, strokeWidth: 0, className: 'text-zinc-900 dark:text-zinc-50 cursor-pointer hover:r-6 transition-all'}}
                                    activeDot={{r: 6, className: 'text-zinc-900 dark:text-zinc-50'}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Expanded Session View */}
                    {selectedDate && (
                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 animate-fade-in">
                            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
                                Sessions: {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                            </h4>
                            
                            {!selectedSessionData || selectedSessionData.length === 0 ? (
                                <p className="text-sm text-zinc-400 italic">No detailed session data available for this day.</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedSessionData.map((session, idx) => {
                                        const start = new Date(session.startTime);
                                        const end = new Date(session.endTime);
                                        const timeStr = `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`;
                                        const accuracy = Math.round((session.correct / session.total) * 100);
                                        
                                        return (
                                            <div key={idx} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${accuracy >= 80 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                    <span className="font-mono text-zinc-500">{timeStr}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-zinc-900 dark:text-zinc-200 font-medium">{session.correct}/{session.total}</span>
                                                    <span className={`text-xs ${accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : accuracy >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                                                        {accuracy}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Report;
