'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function VoiceRecorder({ isListening, interimText, error, isSupported, onStart, onStop }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval;
        if (isListening) {
            setSeconds(0);
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isListening]);

    const formatTime = (s) => {
        const m = String(Math.floor(s / 60)).padStart(2, '0');
        const sec = String(s % 60).padStart(2, '0');
        return `${m}:${sec}`;
    };

    return (
        <div className="space-y-4">
            {/* Record Button */}
            <div className="flex flex-col items-center gap-4">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={isListening ? onStop : onStart}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isListening
                            ? 'bg-emergency text-white recording-ring shadow-emergency/30'
                            : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30 hover:shadow-glow-blue'
                    }`}
                    disabled={!isSupported}
                    aria-label={isListening ? 'Stop recording' : 'Start recording'}
                >
                    {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}

                    {/* Pulse rings when recording */}
                    {isListening && (
                        <>
                            <span className="absolute inset-0 rounded-full animate-ping bg-emergency/20" />
                            <span className="absolute -inset-2 rounded-full border-2 border-emergency/30 animate-pulse" />
                        </>
                    )}
                </motion.button>

                <div className="text-center">
                    <p className="font-bold text-sm text-text-primary">
                        {isListening ? 'Listening... Tap to stop' : 'Tap to Start Speaking'}
                    </p>
                    {isListening && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-mono text-lg font-bold text-emergency mt-1"
                        >
                            {formatTime(seconds)}
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Recording Banner & Sound Visualizer */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emergency-bg border border-emergency-border rounded-xl p-4 flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="w-3 h-3 bg-emergency rounded-full animate-pulse-dot shrink-0" />
                                <span className="text-sm font-bold text-emergency">
                                    Microphone Active — Speak Naturally
                                </span>
                            </div>
                            {/* Live Soundwave Bar Animation */}
                            <div className="flex items-center gap-1 h-4">
                                <span className="w-1 bg-emergency rounded-full animate-bounce h-3" style={{ animationDelay: '0.1s' }} />
                                <span className="w-1 bg-emergency rounded-full animate-bounce h-5" style={{ animationDelay: '0.3s' }} />
                                <span className="w-1 bg-emergency rounded-full animate-bounce h-2" style={{ animationDelay: '0.2s' }} />
                                <span className="w-1 bg-emergency rounded-full animate-bounce h-4" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                        {seconds >= 3 && (
                            <p className="text-xs text-emergency/80 font-medium pt-1 border-t border-emergency-border/50">
                                💡 Tip: Speak close to your mobile microphone. If your words don&apos;t appear, tap <strong>Hindi (हिं)</strong> or <strong>Marathi (म)</strong> in the language buttons above.
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Interim Text Preview */}
            <AnimatePresence>
                {interimText && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary/70 italic"
                    >
                        {interimText}...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
                <div className="bg-emergency-bg border border-emergency-border rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-emergency shrink-0 mt-0.5" />
                    <p className="text-sm text-emergency font-medium">{error}</p>
                </div>
            )}

            {/* Browser Support Warning */}
            {!isSupported && (
                <div className="bg-warning-bg border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 font-medium">
                    ⚠ Your browser does not support speech recognition. Please use Google Chrome for the best experience.
                </div>
            )}
        </div>
    );
}
