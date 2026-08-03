'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Activity, Mic, FileText, Shield, Languages, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8 py-10 sm:py-20 max-w-7xl mx-auto overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-7 space-y-4 text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/8 text-primary rounded-full border border-primary/15 text-xs font-bold uppercase tracking-wider">
                            <Languages className="w-3.5 h-3.5" />
                            <span>Multilingual AI Intake</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.15]">
                            Express your symptoms in{' '}
                            <span className="gradient-text">your language.</span>
                        </h1>

                        <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Speak naturally in <strong className="text-text-primary">Gujarati</strong>, <strong className="text-text-primary">Hindi</strong>, <strong className="text-text-primary">Marathi</strong>, or <strong className="text-text-primary">English</strong> — or select <strong className="text-text-primary">Auto-Detect</strong>. AI converts your voice into structured clinical intake reports for physicians.
                        </p>

                        {/* Language Pills */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
                            {[
                                { label: '🌐 Auto-Detect', sub: 'Multilingual', color: 'bg-purple-500' },
                                { label: 'ગુજરાતી', sub: 'Gujarati', color: 'bg-emerald-500' },
                                { label: 'हिन्दी', sub: 'Hindi', color: 'bg-amber-500' },
                                { label: 'मराठी', sub: 'Marathi', color: 'bg-rose-500' },
                                { label: 'English', sub: 'EN', color: 'bg-blue-500' },
                            ].map((lang) => (
                                <div key={lang.label} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-border-default text-xs font-bold shadow-sm">
                                    <span className={`w-2 h-2 rounded-full ${lang.color}`} />
                                    <span>{lang.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 pt-3">
                            <Link
                                href="/select-language"
                                className="bg-primary hover:bg-primary-dark text-white px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-primary/25 hover:shadow-glow-blue hover:scale-[1.02]"
                            >
                                Start Patient Intake
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Preview Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-5"
                    >
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-default shadow-elevated space-y-5 relative">
                            <div className="flex items-center justify-between pb-4 border-b border-border-default/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <Mic className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Voice Input</span>
                                        <span className="text-sm font-bold text-text-primary">Patient Narrative</span>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                                    Live
                                </span>
                            </div>

                            <div className="bg-surface rounded-2xl p-4 border border-border-default/60 text-sm italic text-text-secondary leading-relaxed">
                                &quot;મને બે દિવસથી છાતીમાં ભારે દુખાવો થાય છે અને ડાબા હાથમાં ખેંચાણ થાય છે.&quot;
                            </div>

                            <div className="bg-primary/5 p-4 rounded-2xl border-l-4 border-primary text-sm font-semibold text-text-primary space-y-1">
                                <span className="text-[10px] font-bold text-primary uppercase block">AI Clinical Translation</span>
                                <p className="leading-relaxed">Patient reports severe substernal chest pressure radiating to the left arm with anxiety over 48 hours.</p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-text-muted font-semibold">
                                <span className="flex items-center gap-1.5 text-success">
                                    <Shield className="w-3.5 h-3.5" />
                                    Clinical Triage Ready
                                </span>
                                <span className="font-mono">Powered by Gemma AI</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white border-t border-border-default/60 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-3"
                    >
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">How It Works</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">Three Steps to Structured Intake</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: <Languages className="w-6 h-6" />, title: 'Select Language', desc: 'Patient chooses Gujarati, Hindi, Marathi, English, or Auto-Detect.' },
                            { step: '02', icon: <Mic className="w-6 h-6" />, title: 'Speak Symptoms', desc: 'Real-time voice transcription captures the patient narrative naturally.' },
                            { step: '03', icon: <Zap className="w-6 h-6" />, title: 'AI Intake Report', desc: 'Gemma AI extracts structured clinical data and flags emergencies instantly.' },
                        ].map((f, i) => (
                            <motion.div
                                key={f.step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="bg-surface p-8 rounded-2xl border border-border-default shadow-card card-interactive space-y-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-text-primary">{f.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Language Expansion & Inclusivity Section */}
            <section className="bg-surface border-t border-border-default/60 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-4 max-w-3xl mx-auto"
                    >
                        <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2">
                            <Languages className="w-4 h-4" />
                            Multilingual Healthcare Access
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
                            Healthcare for Every Regional Voice
                        </h2>
                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                            Patients can express their symptoms naturally in their comfortable native dialect or mix languages freely with full AI clinical intake synthesis.
                        </p>
                    </motion.div>

                    {/* All Live Supported Languages Grid */}
                    <div className="bg-white p-6 sm:p-10 rounded-3xl border border-emerald-200 shadow-card space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-default/60">
                            <div>
                                <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 inline-flex mb-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                                    100% Production Ready
                                </span>
                                <h3 className="text-xl font-bold text-text-primary">Fully Supported Voice Languages</h3>
                            </div>
                            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                                5 Intake Modes Active
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                { name: 'Auto-Detect', native: '🌐 Multilingual', desc: 'Smart automatic language detection', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
                                { name: 'Gujarati', native: 'ગુજરાતી', desc: 'Full voice & text clinical intake', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                                { name: 'Hindi', native: 'हिन्दी', desc: 'Full voice & text clinical intake', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
                                { name: 'Marathi', native: 'मराठी', desc: 'Full voice & text clinical intake', badge: 'bg-rose-100 text-rose-700 border-rose-200' },
                                { name: 'English', native: 'English', desc: 'Standard international clinical intake', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
                            ].map((l) => (
                                <div key={l.name} className="p-4 bg-surface rounded-2xl border border-border-default/80 flex flex-col justify-between space-y-3 hover:border-primary/40 transition">
                                    <div className="space-y-1">
                                        <div className="font-bold text-text-primary text-sm flex items-center justify-between">
                                            <span>{l.name}</span>
                                            <span className="text-xs text-text-muted font-normal">({l.native})</span>
                                        </div>
                                        <p className="text-xs text-text-secondary leading-relaxed">{l.desc}</p>
                                    </div>
                                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border text-center ${l.badge}`}>
                                        Active & Ready
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-primary/5 p-4 rounded-2xl border-l-4 border-primary text-xs sm:text-sm text-text-secondary">
                            <strong className="text-text-primary font-semibold block mb-1">Seamless Clinical Intake</strong>
                            Patients can speak naturally in Gujarati, Hindi, Marathi, English, or mixed dialects. CliniQ AI synthesizes the narrative directly into a structured doctor summary.
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-border-default/60 py-8 px-4 sm:px-6 text-center text-xs text-text-muted">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 font-bold text-text-primary">
                        <Activity className="w-4 h-4 text-primary" />
                        CliniQ AI Clinical Intake Platform
                    </div>
                    <div>Powered by Gemma AI</div>
                </div>
            </footer>
        </div>
    );
}
