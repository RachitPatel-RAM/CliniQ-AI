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

                {/* Future Expansion Roadmap Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-auto bg-white rounded-3xl p-6 border border-border-default shadow-card space-y-4"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
                                Expansion Vision — Future Versions
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                            Regional Inclusivity Roadmap
                        </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                        <strong className="text-text-primary">Why regional languages?</strong> India has immense linguistic diversity. People should be able to explain their health problems in the language they are most comfortable with. This makes healthcare more accessible and inclusive.
                    </p>

                    <div className="space-y-2">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Upcoming Regional Language Support:</span>
                        <div className="flex flex-wrap gap-2">
                            {['Marathi', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese'].map((lang) => (
                                <span key={lang} className="px-3 py-1 bg-surface rounded-lg border border-border-default text-xs font-semibold text-text-secondary">
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
