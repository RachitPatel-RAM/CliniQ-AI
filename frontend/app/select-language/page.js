'use client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LanguageCard from '@/components/LanguageCard';
import useIntakeStore from '@/hooks/useIntakeStore';
import { motion } from 'framer-motion';

const LANGUAGES = [
    { language: 'Gujarati', code: 'gu-IN', script: 'ગુ', nativeText: 'ગુજરાતીમાં વાતચીત શરૂ કરો', description: 'Regional Dialect', color: 'bg-emerald-100 text-emerald-700' },
    { language: 'Hindi', code: 'hi-IN', script: 'हिं', nativeText: 'हिंदी में विवरण दें', description: 'National Language', color: 'bg-amber-100 text-amber-700' },
    { language: 'English', code: 'en-US', script: 'EN', nativeText: 'Standard intake in English', description: 'International Standard', color: 'bg-blue-100 text-blue-700' },
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
                        Choose the language you are most comfortable speaking or typing in.
                    </p>
                </motion.div>

                {/* Language Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            </main>
        </div>
    );
}
