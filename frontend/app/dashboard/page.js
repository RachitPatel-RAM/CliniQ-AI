'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { subscribeToIntakes, confirmIntakeReport } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Search, Plus, AlertTriangle, Clock, Users, X, FileText,
    CheckCircle, Download, ExternalLink, User, Globe, Stethoscope, Heart, Pill,
    Lock, LogOut, KeyRound, ShieldAlert, ArrowRight, ShieldCheck
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function DashboardPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [doctorIdInput, setDoctorIdInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');

    const [intakes, setIntakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const modalReportRef = useRef(null);

    // Check login state on mount
    useEffect(() => {
        const storedAuth = sessionStorage.getItem('cliniq_doctor_auth');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    // Subscribe to Firebase RTDB when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;
        const unsub = subscribeToIntakes((records) => {
            setIntakes(records);
            setLoading(false);
        });
        return unsub;
    }, [isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError('');
        if (doctorIdInput.trim() === 'doctor' && passwordInput === '123456789') {
            sessionStorage.setItem('cliniq_doctor_auth', 'true');
            setIsAuthenticated(true);
        } else {
            setLoginError('Invalid Doctor ID or Password. (Use: ID="doctor", Password="123456789")');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('cliniq_doctor_auth');
        setIsAuthenticated(false);
        setDoctorIdInput('');
        setPasswordInput('');
    };

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

    const handleDownloadPdf = async () => {
        if (!modalReportRef.current || !selectedRecord) return;
        setDownloadingPdf(true);
        try {
            const canvas = await html2canvas(modalReportRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`CliniQ_Report_${selectedRecord.patient?.name || 'Patient'}_${selectedRecord.id?.slice(-6) || 'Doc'}.pdf`);
        } catch (err) {
            console.error('PDF Generation Error:', err);
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleToggleStatus = async (record) => {
        try {
            await confirmIntakeReport(record.id);
            setSelectedRecord(prev => prev ? { ...prev, status: 'Confirmed' } : null);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    // Render Login Screen if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col bg-surface">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-border-default p-8 sm:p-10 shadow-elevated max-w-md w-full space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                                <Lock className="w-7 h-7 text-primary" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-text-primary">Doctor Portal Access</h1>
                            <p className="text-xs text-text-secondary">Enter clinical credentials to access patient intake queue</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Doctor ID</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        required
                                        value={doctorIdInput}
                                        onChange={(e) => setDoctorIdInput(e.target.value)}
                                        placeholder="Enter doctor ID (e.g. doctor)"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-default bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-primary uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="password"
                                        required
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        placeholder="Enter password"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-default bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                                    <span>{loginError}</span>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2"
                            >
                                Login to Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="p-4 bg-surface rounded-2xl border border-border-default/60 text-[11px] text-text-muted space-y-1">
                            <span className="font-bold text-text-primary block">Default Demo Credentials:</span>
                            <p>Doctor ID: <code className="bg-white px-1.5 py-0.5 rounded border border-border-default font-mono font-bold text-primary">doctor</code></p>
                            <p>Password: <code className="bg-white px-1.5 py-0.5 rounded border border-border-default font-mono font-bold text-primary">123456789</code></p>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    // Authenticated Doctor Dashboard
    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border-default shadow-card">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Doctor Access Verified
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Clinical Intake Queue</h1>
                        <p className="text-xs sm:text-sm text-text-secondary">Real-time patient intake reports synced with Firebase RTDB.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/select-language" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20 transition-all">
                            <Plus className="w-4 h-4" /> New Patient Intake
                        </Link>
                        <button onClick={handleLogout} className="bg-surface hover:bg-red-50 text-text-secondary hover:text-red-700 border border-border-default hover:border-red-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<Users className="w-5 h-5" />} label="Total Intakes" value={stats.total} color="text-primary bg-primary/10" />
                    <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Emergency Flags" value={stats.emergency} color="text-red-600 bg-red-100" />
                    <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Review" value={stats.pending} color="text-amber-600 bg-amber-50" />
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search patient name or symptoms..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'emergency', label: 'Emergency (Red)' },
                            { key: 'routine', label: 'Routine (Green)' },
                            { key: 'confirmed', label: 'Confirmed' },
                        ].map((f) => (
                            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === f.key ? 'bg-primary text-white shadow-card' : 'bg-white text-text-secondary border border-border-default hover:border-border-hover'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-border-default shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-default/60 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-text-primary">Patient Records</h3>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Sync Active
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-text-muted text-sm">Loading patient queue...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-text-muted text-sm">
                            {intakes.length === 0 ? 'No patient intakes in queue yet.' : 'No records match search/filter.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-4">Patient Name</th>
                                        <th className="p-4">Language</th>
                                        <th className="p-4">Chief Complaint</th>
                                        <th className="p-4">Emergency Status</th>
                                        <th className="p-4">Review Status</th>
                                        <th className="p-4">Time</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default/40">
                                    <AnimatePresence>
                                        {filtered.map((record) => {
                                            const isEmergency = record.aiResult?.emergency?.flag;
                                            return (
                                                <motion.tr
                                                    key={record.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    onClick={() => setSelectedRecord(record)}
                                                    className="hover:bg-surface/80 transition-colors cursor-pointer"
                                                >
                                                    <td className="p-4 font-bold text-text-primary">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-primary shrink-0" />
                                                            <div>
                                                                <span className="block text-sm font-extrabold">{record.patient?.name || 'Unknown'}</span>
                                                                <span className="text-[10px] text-text-muted font-normal">{record.patient?.age || '—'} Yrs, {record.patient?.gender || '—'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-primary font-semibold">{record.language || '—'}</td>
                                                    <td className="p-4 text-text-secondary truncate max-w-[220px] font-medium">
                                                        {record.aiResult?.chief_complaint || record.transcript?.slice(0, 45) || '—'}
                                                    </td>
                                                    {/* RED for Emergency TRUE, GREEN for Routine FALSE */}
                                                    <td className="p-4">
                                                        {isEmergency ? (
                                                            <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full font-extrabold text-[10px] uppercase inline-flex items-center gap-1.5 shadow-sm animate-pulse">
                                                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                                                CRITICAL EMERGENCY
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[10px] uppercase inline-flex items-center gap-1.5">
                                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                                ROUTINE
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${record.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                            {record.status || 'Pending Review'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-text-muted font-mono">{record.createdAt ? new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }} className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-[11px] transition-all shadow-sm">
                                                            View Report
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Patient Record Detail Modal */}
                {selectedRecord && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border-default shadow-elevated p-6 sm:p-8 space-y-6 relative">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-border-default pb-4">
                                <div>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Clinical Intake Summary</span>
                                    <h2 className="text-2xl font-extrabold text-text-primary">{selectedRecord.patient?.name || 'Patient Report'}</h2>
                                </div>
                                <button onClick={() => setSelectedRecord(null)} className="p-2 rounded-xl hover:bg-surface text-text-muted hover:text-text-primary transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Report Canvas Content for PDF & Screen */}
                            <div ref={modalReportRef} className="space-y-5 bg-white p-2">
                                {/* Patient Header */}
                                <div className="bg-surface rounded-2xl p-4 border border-border-default grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <span className="text-text-muted block text-[10px] uppercase font-bold">Age &amp; Gender</span>
                                        <span className="font-bold text-text-primary">{selectedRecord.patient?.age || '—'} Yrs, {selectedRecord.patient?.gender || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted block text-[10px] uppercase font-bold">Language</span>
                                        <span className="font-bold text-primary">{selectedRecord.language || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted block text-[10px] uppercase font-bold">Status</span>
                                        <span className="font-bold text-emerald-600">{selectedRecord.status || 'Pending Review'}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted block text-[10px] uppercase font-bold">Intake Time</span>
                                        <span className="font-mono">{selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString() : '—'}</span>
                                    </div>
                                </div>

                                {/* Emergency Alert if Flagged */}
                                {selectedRecord.aiResult?.emergency?.flag ? (
                                    <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl text-xs space-y-1 text-red-900">
                                        <div className="flex items-center gap-2 text-red-700 font-extrabold uppercase">
                                            <AlertTriangle className="w-4 h-4 text-red-600" /> CRITICAL EMERGENCY WARNING FLAGGED
                                        </div>
                                        <p className="font-medium">{selectedRecord.aiResult?.emergency?.reasons?.join(', ')}</p>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        <span>Routine Triage: No emergency red flags detected.</span>
                                    </div>
                                )}

                                {/* Chief Complaint */}
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-1">
                                    <span className="text-[10px] font-bold text-primary uppercase">Chief Complaint</span>
                                    <p className="text-sm font-semibold text-text-primary">{selectedRecord.aiResult?.chief_complaint || '—'}</p>
                                </div>

                                {/* Symptoms */}
                                <div className="p-4 bg-surface rounded-2xl border border-border-default space-y-2 text-xs">
                                    <span className="text-[10px] font-bold text-text-muted uppercase">Extracted Symptoms</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRecord.aiResult?.symptoms?.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-white border border-border-default rounded-lg font-semibold text-text-primary shadow-sm">
                                                • {s}
                                            </span>
                                        )) || <p className="text-text-muted">None specified</p>}
                                    </div>
                                </div>

                                {/* Doctor Summary */}
                                <div className="p-4 bg-surface rounded-2xl border border-border-default space-y-1 text-xs">
                                    <span className="text-[10px] font-bold text-text-muted uppercase">Doctor Summary</span>
                                    <p className="text-text-primary leading-relaxed">{selectedRecord.aiResult?.doctor_summary || '—'}</p>
                                </div>

                                {/* Original Transcript */}
                                <div className="p-4 bg-surface rounded-2xl border border-border-default space-y-1 text-xs">
                                    <span className="text-[10px] font-bold text-text-muted uppercase">Original Patient Speech Narrative ({selectedRecord.language})</span>
                                    <p className="text-text-secondary italic">&quot;{selectedRecord.transcript || 'No transcript recorded'}&quot;</p>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-4 border-t border-border-default flex flex-col sm:flex-row justify-between gap-3">
                                <button
                                    onClick={() => handleToggleStatus(selectedRecord)}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                                        selectedRecord.status === 'Confirmed'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                    }`}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {selectedRecord.status === 'Confirmed' ? 'Status: Confirmed' : 'Mark as Confirmed'}
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={downloadingPdf}
                                        className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-primary/20"
                                    >
                                        <Download className="w-4 h-4" />
                                        {downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
                                    </button>
                                    <button onClick={() => setSelectedRecord(null)} className="bg-surface hover:bg-border-default text-text-secondary px-5 py-2.5 rounded-xl font-bold text-xs transition-colors">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
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
