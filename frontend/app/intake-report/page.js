'use client';
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PatientInfoCard from '@/components/PatientInfoCard';
import ReportCard from '@/components/ReportCard';
import EmergencyAlert from '@/components/EmergencyAlert';
import PdfDownloadButton from '@/components/PdfDownloadButton';
import useIntakeStore from '@/hooks/useIntakeStore';
import { saveIntakeReport } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { CheckCircle, Stethoscope, Clock, Pill, Heart, AlertTriangle, HelpCircle, FileText, Loader2 } from 'lucide-react';

export default function IntakeReportPage() {
    const router = useRouter();
    const store = useIntakeStore();
    const { patient, selectedLanguage, transcript, aiResult, setReportId } = store;
    const reportRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [autoSaved, setAutoSaved] = useState(false);

    useEffect(() => {
        if (!aiResult) router.replace('/select-language');
    }, [aiResult, router]);

    // Auto-save to Firebase as soon as the report loads
    useEffect(() => {
        if (!aiResult || !patient?.name || autoSaved) return;

        const autoSave = async () => {
            try {
                console.log('[Firebase] Auto-saving intake report...');
                const id = await saveIntakeReport({
                    patient,
                    language: selectedLanguage,
                    transcript,
                    aiResult,
                });
                setReportId(id);
                setAutoSaved(true);
                console.log('[Firebase] ✅ Auto-saved with ID:', id);
            } catch (err) {
                console.error('[Firebase] ❌ Auto-save failed:', err.message, err);
            }
        };

        autoSave();
    }, [aiResult, patient, selectedLanguage, transcript, autoSaved, setReportId]);

    const handleConfirm = async () => {
        setSaving(true);
        try {
            if (!autoSaved) {
                // If auto-save didn't work, try saving now
                const id = await saveIntakeReport({
                    patient,
                    language: selectedLanguage,
                    transcript,
                    aiResult,
                });
                setReportId(id);
            }
            // Mark as confirmed in Firebase
            if (store.reportId) {
                const { confirmIntakeReport } = await import('@/lib/firebase');
                await confirmIntakeReport(store.reportId);
            }
            setSaved(true);
            setTimeout(() => router.push('/dashboard'), 1200);
        } catch (err) {
            console.error('[Firebase] ❌ Confirm save error:', err.message, err);
            alert('Failed to save: ' + err.message + '\n\nCheck browser console for details.');
            setSaving(false);
        }
    };

    if (!aiResult) return null;
    const ai = aiResult;

    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            Step 4 of 4 — Clinical Report Ready
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

                        {/* SOAP Report Header */}
                        <div className="bg-white rounded-2xl border border-border-default overflow-hidden shadow-card">
                            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <FileText className="w-5 h-5" />
                                    AI Structured Intake Report
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">Gemma AI</span>
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

                                <ReportCard title="Doctor Summary" icon={<FileText className="w-4 h-4" />} variant="highlight" editable>
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
                            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Actions</h3>

                            <button
                                onClick={handleConfirm}
                                disabled={saving || saved}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                    saved ? 'bg-emerald-500 text-white' : 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25'
                                } disabled:opacity-70`}
                            >
                                {saved ? (<><CheckCircle className="w-4 h-4" /> Saved to Dashboard</>) :
                                 saving ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>) :
                                 (<><CheckCircle className="w-4 h-4" /> Confirm &amp; Save Intake</>)}
                            </button>

                            <PdfDownloadButton reportRef={reportRef} patientName={patient.name} />
                        </div>

                        {/* Raw Transcript */}
                        <div className="bg-white rounded-2xl border border-border-default p-5 shadow-card">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Original Transcript</h3>
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
