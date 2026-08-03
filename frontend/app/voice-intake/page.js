'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import VoiceRecorder from '@/components/VoiceRecorder';
import useIntakeStore from '@/hooks/useIntakeStore';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { analyzeIntake } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Keyboard, Loader2, Sparkles, Activity, ShieldCheck, Stethoscope, PlusCircle } from 'lucide-react';

export default function VoiceIntakePage() {
    const router = useRouter();
    const store = useIntakeStore();
    const { patient, selectedLanguage, setTranscript, setAiResult, setAnalyzing, setAnalysisError } = store;
    const speech = useSpeechRecognition(selectedLanguage);
    const [manualText, setManualText] = useState(store.transcript || '');
    const [showManual, setShowManual] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);

    // Redirect if no patient data
    useEffect(() => {
        if (!patient?.name) router.replace('/select-language');
    }, [patient, router]);

    // Sync speech transcript to manual text area cleanly without duplicate stacking
    useEffect(() => {
        if (speech.transcript) {
            setManualText(speech.transcript);
        }
    }, [speech.transcript]);

    const handleStartRecording = () => {
        speech.startListening(manualText);
    };

    // Cycle through engaging loading status messages while analyzing
    useEffect(() => {
        if (!isSubmitting) {
            setLoadingStage(0);
            return;
        }

        const stages = [
            'Processing multilingual voice audio...',
            'Extracting clinical symptoms & duration...',
            'Synthesizing medical summary with CliniQ AI...',
            'Preparing doctor intake report...'
        ];

        const interval = setInterval(() => {
            setLoadingStage((prev) => (prev + 1) % stages.length);
        }, 1800);

        return () => clearInterval(interval);
    }, [isSubmitting]);

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
            alert('AI Analysis failed: ' + err.message + '\n\nPlease ensure your API keys or Ollama instance are active.');
        }
    };

    if (!patient?.name) return null;

    const displayLang = selectedLanguage === 'auto' || selectedLanguage === 'Auto-Detect'
        ? 'Multilingual Auto-Detect'
        : selectedLanguage;

    const loadingMessages = [
        { title: 'Listening & Transcribing', desc: 'Processing your voice in ' + displayLang, icon: Activity },
        { title: 'Clinical Extraction', desc: 'Identifying symptoms, duration & medications', icon: Stethoscope },
        { title: 'AI Synthesis Engine', desc: 'Running CliniQ AI clinical intelligence', icon: Sparkles },
        { title: 'Generating Doctor Brief', desc: 'Formatting report for 3-second physician review', icon: ShieldCheck }
    ];

    const CurrentIcon = loadingMessages[loadingStage].icon;

    return (
        <div className="min-h-screen flex flex-col bg-surface relative overflow-hidden">
            <Navbar />

            {/* Engaging AI Processing Modal Animation Overlay */}
            <AnimatePresence>
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-primary/20 text-center relative overflow-hidden"
                        >
                            {/* Ambient Glow background */}
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl" />

                            {/* Animated Pulse Ring */}
                            <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
                                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                <span className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
                                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-teal-500 text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                    <CurrentIcon className="w-8 h-8 animate-bounce" />
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 mb-2">
                                {loadingMessages[loadingStage].title}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 mb-6">
                                {loadingMessages[loadingStage].desc}
                            </p>

                            {/* Animated Stage Indicators */}
                            <div className="flex justify-center items-center gap-2 mb-6">
                                {loadingMessages.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 rounded-full transition-all duration-500 ${
                                            idx === loadingStage ? 'w-8 bg-primary' : 'w-2 bg-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                CliniQ AI is analyzing patient intake...
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
                        {store.transcript ? 'Add or Edit Symptoms' : 'Describe your symptoms'}
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Speak naturally in <strong className="text-primary">{displayLang}</strong> or type below. We&apos;ll transcribe and synthesize your symptoms into a clinical brief.
                    </p>
                </motion.div>

                {/* Patient Badge */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 bg-white rounded-xl border border-border-default p-4 flex items-center justify-between shadow-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                            {patient.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-sm">
                            <span className="font-bold text-text-primary">{patient.name}</span>
                            <span className="text-text-muted ml-2">{patient.age}y • {patient.gender} • {displayLang}</span>
                        </div>
                    </div>
                    {store.transcript && (
                        <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                            <PlusCircle className="w-3.5 h-3.5" /> Continuing Intake
                        </span>
                    )}
                </motion.div>

                {/* Voice Recorder */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-border-default p-6 sm:p-8 shadow-card space-y-6">
                    <VoiceRecorder
                        isListening={speech.isListening}
                        interimText={speech.interimText}
                        error={speech.error}
                        isSupported={speech.isSupported}
                        onStart={handleStartRecording}
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
                        />
                        <p className="text-xs text-text-muted mt-1 text-right">{manualText.length} characters recorded (Unlimited)</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={isSubmitting || !currentText.trim()}
                        className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/25 disabled:shadow-none cursor-pointer active:scale-[0.99]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing with CliniQ AI...
                            </>
                        ) : (
                            <>
                                {store.transcript ? 'Re-Analyse with Added Symptoms' : 'Analyse by CliniQ AI'}
                                <Sparkles className="w-5 h-5 fill-current" />
                            </>
                        )}
                    </button>
                </motion.div>
            </main>
        </div>
    );
}

