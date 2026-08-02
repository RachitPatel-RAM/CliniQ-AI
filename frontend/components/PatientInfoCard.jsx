'use client';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function PatientInfoCard({ patient, language, delay = 0 }) {
    if (!patient) return null;

    const initials = patient.name
        ? patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-5"
        >
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xl border border-primary/20 shrink-0">
                {initials}
            </div>

            {/* Details */}
            <div className="flex-1 w-full">
                <h2 className="text-xl font-extrabold text-text-primary mb-3">{patient.name || 'Unknown Patient'}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-border-default/60 text-xs">
                    <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Age</span>
                        <span className="font-semibold text-text-primary">{patient.age || '—'} years</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Gender</span>
                        <span className="font-semibold text-text-primary">{patient.gender || '—'}</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Language</span>
                        <span className="font-semibold text-primary">{language || patient.language || '—'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
