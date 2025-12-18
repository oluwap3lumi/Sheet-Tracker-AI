
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SheetRow, ViewMode } from './types';
import { getSheetInsights } from './services/geminiService';
import StatCard from './components/StatCard';
import DataTable from './components/DataTable';
import { 
  LayoutDashboard, 
  Database, 
  RefreshCw, 
  Sparkles, 
  Plus, 
  History,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Table as TableIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Initial Mock Data
const INITIAL_MOCK_DATA: SheetRow[] = [
  { id: '1', timestamp: '2024-05-20 09:00:01', user: 'Alice Chen', source: 'Web Form', status: 'completed', value: 1200 },
  { id: '2', timestamp: '2024-05-20 10:15:42', user: 'Bob Smith', source: 'Referral', status: 'pending', value: 850 },
  { id: '3', timestamp: '2024-05-20 11:30:15', user: 'Charlie Day', source: 'Direct', status: 'active', value: 2100 },
];

const App: React.FC = () => {
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [lastProcessedCount, setLastProcessedCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ALL);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize data from local storage or defaults
  useEffect(() => {
    const savedData = localStorage.getItem('sheet_tracker_data');
    const savedCount = localStorage.getItem('last_processed_count');

    if (savedData) {
      setRows(JSON.parse(savedData));
    } else {
      setRows(INITIAL_MOCK_DATA);
    }

    if (savedCount) {
      setLastProcessedCount(parseInt(savedCount, 10));
    } else {
      setLastProcessedCount(INITIAL_MOCK_DATA.length);
    }
  }, []);

  // Save to persistent storage
  useEffect(() => {
    localStorage.setItem('sheet_tracker_data', JSON.stringify(rows));
  }, [rows]);

  const newRows = useMemo(() => rows.slice(lastProcessedCount), [rows, lastProcessedCount]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setLoading(true);
    
    // Simulate API Fetch delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update state to track that we've seen everything
    setLastProcessedCount(rows.length);
    localStorage.setItem('last_processed_count', rows.length.toString());
    
    // Get AI Insights for the new rows we just processed
    if (newRows.length > 0) {
      const summary = await getSheetInsights(newRows);
      setInsights(summary);
    } else {
      setInsights("No new data was detected during this run.");
    }

    setLoading(false);
    setIsRefreshing(false);
  }, [rows.length, newRows]);

  const addMockRow = () => {
    const users = ['Diana Ross', 'Evan Wright', 'Fiona May', 'George Costanza', 'Homer Simpson'];
    const sources = ['Instagram Ads', 'Email Campaign', 'API Connection', 'Slack Hook'];
    const statuses: ('active' | 'pending' | 'completed')[] = ['active', 'pending', 'completed'];
    
    const newRow: SheetRow = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      user: users[Math.floor(Math.random() * users.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      value: Math.floor(Math.random() * 5000) + 100
    };

    setRows(prev => [...prev, newRow]);
  };

  const chartData = useMemo(() => {
    const counts = rows.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [rows]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <TableIcon size={24} />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                SheetTrack AI
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={addMockRow}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all active:scale-95"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Test Row</span>
              </button>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Run Tracker</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts / Info */}
        {newRows.length > 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 text-amber-800 animate-pulse">
            <AlertCircle className="shrink-0" />
            <p className="font-medium">
              Detecting <span className="font-bold underline">{newRows.length} new rows</span> added since your last processing run.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            label="Total Entries" 
            value={rows.length} 
            icon={<Database size={24} />} 
            colorClass="bg-blue-100 text-blue-600" 
          />
          <StatCard 
            label="New Entries Detected" 
            value={newRows.length} 
            icon={<History size={24} />} 
            colorClass="bg-amber-100 text-amber-600" 
          />
          <StatCard 
            label="Processed Index" 
            value={lastProcessedCount} 
            icon={<RefreshCw size={24} />} 
            colorClass="bg-emerald-100 text-emerald-600" 
          />
          <StatCard 
            label="Gross Volume" 
            value={`$${rows.reduce((sum, r) => sum + r.value, 0).toLocaleString()}`} 
            icon={<TrendingUp size={24} />} 
            colorClass="bg-purple-100 text-purple-600" 
          />
        </div>

        {/* AI Analysis & Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-emerald-500" />
                AI Content Insights
              </h2>
            </div>
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Gemini is analyzing your sheet data...</p>
              </div>
            ) : insights ? (
              <div className="prose prose-slate max-w-none bg-slate-50 p-5 rounded-xl border border-slate-100 italic text-slate-700">
                {insights.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 leading-relaxed">{line}</p>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                <LayoutDashboard size={48} className="mb-4 opacity-20" />
                <p>Run the tracker to generate AI-powered insights on new data.</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Status Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.name === 'completed' ? '#10b981' : 
                        entry.name === 'pending' ? '#f59e0b' : 
                        '#3b82f6'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {chartData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-500 font-medium">{item.name}</span>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data View Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 w-fit">
            <button 
              onClick={() => setViewMode(ViewMode.ALL)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === ViewMode.ALL ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All Rows
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.NEW)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === ViewMode.NEW ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              New Only
              {newRows.length > 0 && <span className="bg-amber-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">{newRows.length}</span>}
            </button>
          </div>

          <div className="text-slate-500 text-sm flex items-center gap-2">
            <Database size={16} />
            <span>Connected to Spreadsheet ID: <code className="bg-slate-100 px-2 py-1 rounded text-emerald-700">1v9_...x8A1</code></span>
          </div>
        </div>

        {/* Data Tables */}
        {viewMode === ViewMode.ALL ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TableIcon size={18} className="text-slate-400" />
                Master Database
              </h3>
              <span className="text-xs text-slate-400 font-medium italic">Showing {rows.length} total entries</span>
            </div>
            <DataTable rows={rows} emptyMessage="No data available in spreadsheet." />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-500" />
                New Delta (Unprocessed)
              </h3>
              <span className="text-xs text-slate-400 font-medium italic">Showing {newRows.length} new entries</span>
            </div>
            <DataTable 
              rows={newRows} 
              emptyMessage="No new rows detected since your last refresh." 
            />
          </div>
        )}

        <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
          <p>© 2024 SheetTrack AI - State persistence managed via LocalStorage. Powered by Gemini 3 Flash.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
              API Documentation <ExternalLink size={10} />
            </a>
            <a href="#" className="hover:text-emerald-500 transition-colors flex items-center gap-1">
              GCP Billing <ExternalLink size={10} />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
