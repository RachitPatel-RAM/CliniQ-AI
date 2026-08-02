'use client';
import { motion } from 'framer-motion';

export default function LanguageCard({ language, script, nativeText, description, color, onClick, delay = 0 }) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -4, boxShadow: '0 12px 30px -8px rgba(0, 87, 217, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group p-6 sm:p-8 bg-white rounded-2xl border-2 border-border-default hover:border-primary text-left flex flex-col justify-between transition-colors focus-ring w-full min-h-[220px]"
        >
            <div>
                {/* Script Badge */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl font-extrabold transition-colors ${color} group-hover:bg-primary group-hover:text-white`}>
                    {script}
                </div>

                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">
                    {description}
                </span>
                <h3 className="text-2xl font-extrabold text-text-primary mb-1">{language}</h3>
                <p className="text-sm text-text-secondary font-medium">{nativeText}</p>
            </div>

            <div className="flex items-center text-primary font-bold text-sm pt-5 mt-4 border-t border-border-default/60 group-hover:gap-3 transition-all">
                <span>Select {language}</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </div>
        </motion.button>
    );
}
