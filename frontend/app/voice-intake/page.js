'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import VoiceRecorder from '@/components/VoiceRecorder';
import useIntakeStore from '@/hooks/useIntakeStore';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { analyzeIntake } from '@/lib/api';
import { motion } from 'framer-motion';
import { Mic, Keyboard, Loader2 } from 'lucide-react';

export default function VoiceIntakePage() {
    const router = useRouter();
    const store = useIntakeStore();
    const { patient, selectedLanguage, setTranscript, setAiResult, setAnalyzing, setAnalysisError } = store;
    const speech = useSpeechRecognition(selectedLanguage);
    const [manualText, setManualText] = useState('');
    const [showManual, setShowManual] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if no patient data
    useEffect(() => {
        if (!patient?.name) router.replace('/select-language');
    }, [patient, router]);

    // Sync speech transcript to manual text area
    useEffect(() => {
        if (speech.transcript) setManualText(speech.transcript);
    }, [speech.transcript]);

    const currentText = manualText || speech.transcript;

    const handleAnalyze = async () => {
        if (!currentText.trim()) {
            alert('Please speak or type your symptoms before submitting.');
            return;
        }

        setIsSubmitting(true);
        setAnalyzing(true);
        setTranscript(currentText.trim());

        try {
            const result = await analyzeIntake(patient, currentText.trim());
            setAiResult(result);
            router.push('/intake-report');
        } catch (err) {
            setAnalysisError(err.message);
            setIsSubmitting(false);
            setAnalyzing(false);
            alert('AI Analysis failed: ' + err.message + '\n\nPlease ensure Ollama is running with gemma3:4b model.');
        }
    };

    if (!patient?.name) return null;

    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
                            Step 3 of 4 — Voice Intake
                        </span>
                        <span className="text-xs font-mono font-bold text-text-muted">75%</span>
                    </div>
                    <div className="w-full h-2 bg-border-default rounded-full overflow-hidden">
                        <motion.div initial={{ width: '50%' }} animate={{ width: '75%' }} transition={{ duration: 0.6 }} className="h-full bg-primary rounded-full" />
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">Describe your symptoms</h1>
                    <p className="text-sm text-text-secondary">
                        Speak naturally in <strong className="text-primary">{selectedLanguage}</strong>. We&apos;ll transcribe and analyze your symptoms.
                    </p>
                </motion.div>

                {/* Patient Badge */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 bg-white rounded-xl border border-border-default p-4 flex items-center gap-3 shadow-card">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                        {patient.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-text-primary">{patient.name}</span>
                        <span className="text-text-muted ml-2">{patient.age}y • {patient.gender} • {selectedLanguage}</span>
                    </div>
                </motion.div>

                {/* Voice Recorder */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-border-default p-6 sm:p-8 shadow-card space-y-6">
                    <VoiceRecorder
                        isListening={speech.isListening}
                        interimText={speech.interimText}
                        error={speech.error}
                        isSupported={speech.isSupported}
                        onStart={speech.startListening}
                        onStop={speech.stopListening}
                    />

                    {/* Toggle manual input */}
                    <div className="flex items-center justify-center">
                        <button onClick={() => setShowManual(!showManual)} className="text-xs font-semibold text-text-muted hover:text-primary transition flex items-center gap-1.5">
                            <Keyboard className="w-3.5 h-3.5" />
                            {showManual ? 'Hide' : 'Or type'} manually
                        </button>
                    </div>

                    {/* Transcript / Manual textarea */}
                    <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                            {speech.transcript ? 'Transcribed Text' : 'Symptom Text'}
                        </label>
                        <textarea
                            rows={5}
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            placeholder={showManual ? 'Type your symptoms here...' : 'Your spoken words will appear here...'}
                            className="w-full bg-surface rounded-xl p-4 text-sm border border-border-default focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
                            readOnly={!showManual && !speech.transcript}
                        />
                        <p className="text-xs text-text-muted mt-1 text-right">{manualText.length} / 2000 chars</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={isSubmitting || !currentText.trim()}
                        className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/25 disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing with Gemma AI...
                            </>
                        ) : (
                            <>
                                Analyze Symptoms with AI
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                </svg>
                            </>
                        )}
                    </button>
                </motion.div>
            </main>
        </div>
    );
}
