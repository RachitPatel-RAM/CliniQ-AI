'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PatientInfoCard from '@/components/PatientInfoCard';
import ReportCard from '@/components/ReportCard';
import EmergencyAlert from '@/components/EmergencyAlert';
import PdfDownloadButton from '@/components/PdfDownloadButton';
import useIntakeStore from '@/hooks/useIntakeStore';
import { saveIntakeReport } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { CheckCircle, Stethoscope, Clock, Pill, Heart, AlertTriangle, HelpCircle, FileText, Loader2, Home, ArrowRight, ShieldCheck, PlusCircle, Activity, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function IntakeReportPage() {
    const router = useRouter();
    const store = useIntakeStore();
    const { patient, selectedLanguage, transcript, aiResult, setReportId, reset } = store;
    const reportRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!aiResult) router.replace('/select-language');
    }, [aiResult, router]);

    // Save ONLY when user explicitly clicks "Confirm & Save Intake"
    const handleConfirmAndSave = async () => {
        setSaving(true);
        try {
            console.log('[Firebase] Saving intake report on user submit...');
            const id = await saveIntakeReport({
                patient,
                language: selectedLanguage,
                transcript,
                aiResult,
            });
            setReportId(id);
            setSubmitted(true);
        } catch (err) {
            console.error('[Firebase] ❌ Save failed:', err.message, err);
            alert('Failed to submit report: ' + err.message);
            setSaving(false);
        }
    };

    const handleContinueExplaining = () => {
        router.push('/voice-intake');
    };

    if (!aiResult) return null;
    const ai = aiResult;

    const isEmergency = !!ai.emergency?.flag;
    const symptomsCount = ai.symptoms?.length || 0;

    // Thank You Screen after manual submit
    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col bg-surface">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl border border-border-default p-8 sm:p-12 shadow-elevated max-w-xl w-full text-center space-y-6"
                    >
                        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-card">
                            <CheckCircle className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-200">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Report Submitted to Clinic
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                                Thank You, {patient.name || 'Patient'}!
                            </h1>
                            <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                                We have received your intake details. Your report has been dispatched to the attending doctor queue.
                            </p>
                        </div>

                        <div className="bg-surface p-5 rounded-2xl border border-border-default/60 text-left space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold text-text-primary">
                                <span>Status: Submitted &amp; Pending Doctor Review</span>
                                <span className="text-emerald-600">Synced</span>
                            </div>
                            <p className="text-text-muted leading-normal">
                                The doctor will review your clinical summary and call or attend to you shortly. You do not need to take any further action.
                            </p>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/"
                                onClick={() => reset()}
                                className="bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                            >
                                <Home className="w-4 h-4" /> Return to Home
                            </Link>
                            <Link
                                href="/select-language"
                                onClick={() => reset()}
                                className="bg-white border border-border-default text-text-primary hover:bg-surface px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                Start New Intake <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            Step 4 of 4 — Review Clinical Report
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-600">100%</span>
                    </div>
                    <div className="w-full h-2 bg-border-default rounded-full overflow-hidden">
                        <motion.div initial={{ width: '75%' }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} className="h-full bg-emerald-500 rounded-full" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" ref={reportRef}>
                    {/* Main Column */}
                    <div className="lg:col-span-8 space-y-5">
                        <PatientInfoCard patient={patient} language={selectedLanguage} />

                        {/* AI Clinical Category Breakdown Badge Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className={`p-4 rounded-2xl border ${isEmergency ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Triage Status</span>
                                <span className="font-extrabold text-sm flex items-center gap-1.5">
                                    {isEmergency ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                                    {isEmergency ? 'Urgent Attention' : 'Standard Routine'}
                                </span>
                            </div>

                            <div className="p-4 bg-white rounded-2xl border border-border-default text-text-primary">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Extracted Symptoms</span>
                                <span className="font-extrabold text-sm flex items-center gap-1.5 text-primary">
                                    <Activity className="w-4 h-4" />
                                    {symptomsCount} {symptomsCount === 1 ? 'Symptom' : 'Symptoms'}
                                </span>
                            </div>

                            <div className="p-4 bg-white rounded-2xl border border-border-default text-text-primary">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Duration</span>
                                <span className="font-extrabold text-sm flex items-center gap-1.5 text-text-primary">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    {ai.duration || 'Unspecified'}
                                </span>
                            </div>

                            <div className="p-4 bg-white rounded-2xl border border-border-default text-text-primary">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Clinical Engine</span>
                                <span className="font-extrabold text-sm flex items-center gap-1.5 text-primary">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    CliniQ AI
                                </span>
                            </div>
                        </div>

                        {/* Structured Clinical Report */}
                        <div className="bg-white rounded-2xl border border-border-default overflow-hidden shadow-card">
                            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <FileText className="w-5 h-5" />
                                    AI Structured Intake Report
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">Gemma AI Engine</span>
                            </div>

                            <div className="p-6 space-y-5">
                                <ReportCard title="Chief Complaint" icon={<Stethoscope className="w-4 h-4" />} variant="highlight" editable>
                                    <p className="font-semibold text-base">{ai.chief_complaint || 'No chief complaint identified'}</p>
                                </ReportCard>

                                <ReportCard title="Symptoms" icon={<Heart className="w-4 h-4" />} editable>
                                    {ai.symptoms?.length > 0 ? (
                                        <ul className="space-y-1.5">
                                            {ai.symptoms.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-text-muted">No symptoms extracted</p>}
                                </ReportCard>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ReportCard title="Duration" icon={<Clock className="w-4 h-4" />} editable>
                                        <p className="font-semibold">{ai.duration || 'Not specified'}</p>
                                    </ReportCard>
                                    <ReportCard title="Allergies" icon={<AlertTriangle className="w-4 h-4" />} editable>
                                        <p>{ai.allergies?.length > 0 ? ai.allergies.join(', ') : 'None reported'}</p>
                                    </ReportCard>
                                </div>

                                <ReportCard title="Current Medications" icon={<Pill className="w-4 h-4" />} editable>
                                    <p>{ai.current_medications?.length > 0 ? ai.current_medications.join(', ') : 'None reported'}</p>
                                </ReportCard>

                                <ReportCard title="Existing Conditions" editable>
                                    <p>{ai.existing_conditions?.length > 0 ? ai.existing_conditions.join(', ') : 'None reported'}</p>
                                </ReportCard>

                                {ai.missing_information?.length > 0 && (
                                    <ReportCard title="Missing Information" icon={<HelpCircle className="w-4 h-4" />} variant="warning">
                                        <ul className="space-y-1">
                                            {ai.missing_information.map((m, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-yellow-600">•</span>
                                                    <span>{m}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </ReportCard>
                                )}

                                <ReportCard title="Doctor Summary (3-Sec Scan)" icon={<FileText className="w-4 h-4" />} variant="highlight" editable>
                                    <p className="leading-relaxed">{ai.doctor_summary || 'No summary generated'}</p>
                                </ReportCard>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-5">
                        <EmergencyAlert flag={ai.emergency?.flag} reasons={ai.emergency?.reasons} />

                        {/* Actions */}
                        <div className="bg-white rounded-2xl border border-border-default p-6 shadow-card space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Actions &amp; Options</h3>

                            {/* Continue Explaining / Add More Symptoms Button */}
                            <button
                                onClick={handleContinueExplaining}
                                className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add / Explain More Symptoms
                            </button>

                            <button
                                onClick={handleConfirmAndSave}
                                disabled={saving}
                                className="w-full py-4 rounded-xl font-bold text-sm bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving to Database...</>
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> Confirm &amp; Save Intake</>
                                )}
                            </button>

                            <PdfDownloadButton reportRef={reportRef} patientName={patient.name} />
                        </div>

                        {/* Raw Transcript */}
                        <div className="bg-white rounded-2xl border border-border-default p-5 shadow-card">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Original Patient Narrative</h3>
                            <p className="text-sm text-text-secondary italic leading-relaxed bg-surface rounded-xl p-4 border border-border-default/60">
                                &quot;{transcript}&quot;
                            </p>
                            <p className="text-[10px] text-text-muted mt-2">Language: {selectedLanguage}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
