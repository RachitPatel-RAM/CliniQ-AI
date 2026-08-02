'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import useIntakeStore from '@/hooks/useIntakeStore';
import { motion } from 'framer-motion';
import { User, Calendar, UserCircle } from 'lucide-react';

export default function PatientDetailsPage() {
    const router = useRouter();
    const { selectedLanguage, setPatient } = useIntakeStore();
    const [form, setForm] = useState({ name: '', age: '', gender: '' });
    const [errors, setErrors] = useState({});

    if (typeof window !== 'undefined' && !selectedLanguage) {
        router.replace('/select-language');
        return null;
    }

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Patient name is required';
        if (!form.age.trim()) errs.age = 'Age is required';
        else if (isNaN(form.age) || +form.age < 0 || +form.age > 150) errs.age = 'Enter a valid age';
        if (!form.gender) errs.gender = 'Please select gender';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setPatient({ name: form.name.trim(), age: form.age.trim(), gender: form.gender });
        router.push('/voice-intake');
    };

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface">
            <Navbar />
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
                            Step 2 of 4 — Patient Details
                        </span>
                        <span className="text-xs font-mono font-bold text-text-muted">50%</span>
                    </div>
                    <div className="w-full h-2 bg-border-default rounded-full overflow-hidden">
                        <motion.div initial={{ width: '25%' }} animate={{ width: '50%' }} transition={{ duration: 0.6 }} className="h-full bg-primary rounded-full" />
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary mb-2">Patient Information</h1>
                    <p className="text-sm text-text-secondary">Language: <strong className="text-primary">{selectedLanguage}</strong></p>
                </motion.div>

                <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-default p-6 sm:p-8 shadow-card space-y-6">
                    <div>
                        <label htmlFor="pname" className="flex items-center gap-2 text-sm font-bold text-text-primary mb-2"><User className="w-4 h-4 text-primary" />Full Name</label>
                        <input id="pname" type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Enter patient full name" className={`w-full px-4 py-3 rounded-xl border text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.name ? 'border-emergency' : 'border-border-default'}`} />
                        {errors.name && <p className="text-xs text-emergency mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="page" className="flex items-center gap-2 text-sm font-bold text-text-primary mb-2"><Calendar className="w-4 h-4 text-primary" />Age (Years)</label>
                        <input id="page" type="number" min="0" max="150" value={form.age} onChange={e => handleChange('age', e.target.value)} placeholder="Enter age" className={`w-full px-4 py-3 rounded-xl border text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 ${errors.age ? 'border-emergency' : 'border-border-default'}`} />
                        {errors.age && <p className="text-xs text-emergency mt-1">{errors.age}</p>}
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-text-primary mb-3"><UserCircle className="w-4 h-4 text-primary" />Gender</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Male', 'Female', 'Other'].map(g => (
                                <button key={g} type="button" onClick={() => handleChange('gender', g)} className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${form.gender === g ? 'border-primary bg-primary/8 text-primary' : 'border-border-default text-text-secondary hover:border-border-hover'}`}>{g}</button>
                            ))}
                        </div>
                        {errors.gender && <p className="text-xs text-emergency mt-1">{errors.gender}</p>}
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:shadow-glow-blue">
                        Continue to Voice Intake
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </button>
                </motion.form>
            </main>
        </div>
    );
}
