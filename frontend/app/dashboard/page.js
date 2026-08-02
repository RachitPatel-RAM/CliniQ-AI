'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { subscribeToIntakes } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Search, Plus, AlertTriangle, Clock, Users, Filter } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [intakes, setIntakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const unsub = subscribeToIntakes((records) => {
            setIntakes(records);
            setLoading(false);
        });
        return unsub;
    }, []);

    const filtered = intakes.filter((r) => {
        const matchesSearch = !search || r.patient?.name?.toLowerCase().includes(search.toLowerCase()) || r.aiResult?.chief_complaint?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'emergency' && r.aiResult?.emergency?.flag) || (filter === 'routine' && !r.aiResult?.emergency?.flag) || (filter === 'confirmed' && r.status === 'Confirmed');
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: intakes.length,
        emergency: intakes.filter(r => r.aiResult?.emergency?.flag).length,
        pending: intakes.filter(r => r.status !== 'Confirmed').length,
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-text-primary mb-1">Clinical Intake Queue</h1>
                        <p className="text-sm text-text-secondary">Real-time patient intake reports synced with Firebase.</p>
                    </div>
                    <Link href="/select-language" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-primary/20 transition-all hover:shadow-glow-blue">
                        <Plus className="w-4 h-4" /> New Patient Intake
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<Users className="w-5 h-5" />} label="Total Intakes" value={stats.total} color="text-primary bg-primary/10" />
                    <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Emergency Flags" value={stats.emergency} color="text-emergency bg-emergency-bg" />
                    <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Review" value={stats.pending} color="text-amber-600 bg-warning-bg" />
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by patient name or complaint..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'emergency', label: 'Emergency' },
                            { key: 'routine', label: 'Routine' },
                            { key: 'confirmed', label: 'Confirmed' },
                        ].map((f) => (
                            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f.key ? 'bg-primary text-white shadow-card' : 'bg-white text-text-secondary border border-border-default hover:border-border-hover'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-border-default shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-default/60 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-text-primary">Intake Records</h3>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                            Live Sync
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-text-muted text-sm">Loading intake records...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-text-muted text-sm">
                            {intakes.length === 0 ? 'No intake records yet. Click "New Patient Intake" to start.' : 'No records match your search/filter.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-4">Patient</th>
                                        <th className="p-4">Language</th>
                                        <th className="p-4">Chief Complaint</th>
                                        <th className="p-4">Priority</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default/40">
                                    <AnimatePresence>
                                        {filtered.map((record) => (
                                            <motion.tr
                                                key={record.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-surface/70 transition-colors cursor-default"
                                            >
                                                <td className="p-4 font-bold text-text-primary">{record.patient?.name || 'Unknown'}</td>
                                                <td className="p-4 text-primary font-semibold">{record.language || '—'}</td>
                                                <td className="p-4 text-text-secondary truncate max-w-[250px]">{record.aiResult?.chief_complaint || record.transcript?.slice(0, 60) || '—'}</td>
                                                <td className="p-4">
                                                    {record.aiResult?.emergency?.flag ? (
                                                        <span className="px-3 py-1 bg-emergency-bg text-emergency border border-emergency-border rounded-full font-bold text-[10px] uppercase">Critical</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] uppercase">Routine</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${record.status === 'Confirmed' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                                                        {record.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-text-muted font-mono">{record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'}</td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border-default p-5 shadow-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-extrabold text-text-primary">{value}</p>
            </div>
        </motion.div>
    );
}
