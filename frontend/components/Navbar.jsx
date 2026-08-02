'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isDoctorRoute = pathname === '/dashboard' || pathname === '/doctor';

    return (
        <header className="sticky top-0 z-50 glass-strong border-b border-border-default/60 shadow-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
                {/* Brand */}
                <Link href={isDoctorRoute ? "/doctor" : "/"} className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                        <Activity className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-lg text-primary leading-none tracking-tight">CliniQ AI</span>
                        <span className="text-[9px] text-text-muted tracking-widest font-semibold uppercase mt-0.5 hidden sm:block">
                            {isDoctorRoute ? 'Doctor Clinical Portal' : 'Clinical Intake Assistant'}
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav (Hide Home & New Intake on Doctor side) */}
                {!isDoctorRoute && (
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink href="/" label="Home" active={pathname === '/'} />
                        <NavLink href="/select-language" label="New Intake" active={pathname.startsWith('/select-language') || pathname.startsWith('/patient-details') || pathname.startsWith('/voice-intake')} />
                    </nav>
                )}

                {/* CTA + Mobile Toggle */}
                <div className="flex items-center gap-3">
                    {!isDoctorRoute && (
                        <Link
                            href="/select-language"
                            className="hidden sm:flex bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl font-bold text-xs transition-all items-center gap-2 shadow-md hover:shadow-glow-blue"
                        >
                            <span>Start Intake</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    )}
                    {!isDoctorRoute && (
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-border-default/50 transition"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle navigation"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {!isDoctorRoute && mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden border-t border-border-default bg-white px-4 py-3 space-y-1"
                >
                    <MobileNavLink href="/" label="Home" onClick={() => setMobileOpen(false)} />
                    <MobileNavLink href="/select-language" label="New Patient Intake" onClick={() => setMobileOpen(false)} />
                </motion.div>
            )}
        </header>
    );
}

function NavLink({ href, label, active }) {
    return (
        <Link
            href={href}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                active
                    ? 'text-primary bg-primary/8'
                    : 'text-text-secondary hover:text-primary hover:bg-primary/5'
            }`}
        >
            {label}
        </Link>
    );
}

function MobileNavLink({ href, label, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-4 py-3 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface hover:text-primary transition-colors"
        >
            {label}
        </Link>
    );
}
