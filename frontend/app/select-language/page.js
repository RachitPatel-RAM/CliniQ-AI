'use client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LanguageCard from '@/components/LanguageCard';
import useIntakeStore from '@/hooks/useIntakeStore';
import { motion } from 'framer-motion';

const LANGUAGES = [
    { language: 'Auto-Detect', code: 'auto', script: '🌐', nativeText: 'Auto-Detect (Gujarati, Hindi, Marathi, English)', description: 'Multilingual Smart Detection', color: 'bg-purple-100 text-purple-700' },
    { language: 'Gujarati', code: 'gu-IN', script: 'ગુ', nativeText: 'ગુજરાતીમાં વાતચીત શરૂ કરો', description: 'Regional Dialect', color: 'bg-emerald-100 text-emerald-700' },
    { language: 'Hindi', code: 'hi-IN', script: 'हिं', nativeText: 'हिंदी में विवरण दें', description: 'National Language', color: 'bg-amber-100 text-amber-700' },
    { language: 'Marathi', code: 'mr-IN', script: 'म', nativeText: 'मराठीत माहिती द्या', description: 'Regional Language', color: 'bg-rose-100 text-rose-700' },
    { language: 'English', code: 'en-IN', script: 'EN', nativeText: 'Standard intake in English', description: 'International Standard', color: 'bg-blue-100 text-blue-700' },
];

export default function SelectLanguagePage() {
    const router = useRouter();
    const setLanguage = useIntakeStore((s) => s.setLanguage);

    const handleSelect = (lang) => {
        setLanguage(lang.language, lang.code);
        router.push('/patient-details');
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col">
                {/* Progress Bar */}
                <div className="mb-8 sm:mb-10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
                            Step 1 of 4 — Language Selection
                        </span>
                        <span className="text-xs font-mono font-bold text-text-muted">25%</span>
                    </div>
                    <div className="w-full h-2 bg-border-default rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '25%' }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full bg-primary rounded-full"
                        />
                    </div>
                </div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center sm:text-left"
                >
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary mb-2">
                        Select your consultation language
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Choose your preferred language or select <strong>Auto-Detect</strong> to speak freely in Gujarati, Hindi, Marathi, or English.
                    </p>
                </motion.div>

                {/* Language Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-12">
                    {LANGUAGES.map((lang, i) => (
                        <LanguageCard
                            key={lang.language}
                            language={lang.language}
                            script={lang.script}
                            nativeText={lang.nativeText}
                            description={lang.description}
                            color={lang.color}
                            onClick={() => handleSelect(lang)}
                            delay={i * 0.1}
                        />
                    ))}
                </div>

                {/* Active Multilingual Support Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-auto bg-white rounded-3xl p-6 border border-emerald-200 shadow-card space-y-4"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                            <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
                                Multilingual Healthcare Engine
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit">
                            100% Production Ready
                        </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                        <strong className="text-text-primary">Speak in your comfortable dialect:</strong> Patients can speak naturally in <strong>Gujarati</strong>, <strong>Hindi</strong>, <strong>Marathi</strong>, <strong>English</strong>, or select <strong>Auto-Detect</strong> to mix languages. CliniQ AI transcribes and synthesizes clinical narratives in real time.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                        {[
                            { name: '🌐 Auto-Detect', status: 'Multilingual' },
                            { name: 'ગુ ગુજરાતી', status: 'Active' },
                            { name: 'हिं हिंदी', status: 'Active' },
                            { name: 'म मराठी', status: 'Active' },
                            { name: 'EN English', status: 'Active' },
                        ].map((item) => (
                            <span key={item.name} className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                <span>{item.name}</span>
                                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded font-mono uppercase">{item.status}</span>
                            </span>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
