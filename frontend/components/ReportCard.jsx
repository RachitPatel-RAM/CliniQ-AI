'use client';
import { motion } from 'framer-motion';

export default function ReportCard({ title, icon, children, variant = 'default', editable = false, delay = 0 }) {
    const variants = {
        default: 'bg-white border-border-default',
        highlight: 'bg-primary/5 border-primary/20',
        warning: 'bg-warning-bg border-yellow-200',
        success: 'bg-success-bg border-green-200',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`rounded-2xl border p-5 sm:p-6 ${variants[variant]}`}
        >
            <div className="flex items-center gap-2 mb-3">
                {icon && <span className="text-primary">{icon}</span>}
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">{title}</h3>
            </div>
            <div className={`text-sm text-text-primary leading-relaxed ${editable ? 'outline-none focus:ring-2 focus:ring-primary/30 rounded-lg p-1 -m-1' : ''}`}
                contentEditable={editable}
                suppressContentEditableWarning={editable}
            >
                {children}
            </div>
        </motion.div>
    );
}
