// CliniQ AI — Continuous, Mobile-Optimized & Accurate Web Speech API Hook for Voice-to-Text
'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

const LANGUAGE_MAP = {
    'Auto-Detect': '',
    'auto': '',
    'Gujarati': 'gu-IN',
    'Hindi': 'hi-IN',
    'English': 'en-US',
};

/**
 * Clean word repetitions and unwanted artifacts
 */
export function deduplicateText(text) {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text.trim();

    // 1. Remove adjacent duplicate single words (case-insensitive), e.g. "fever fever" -> "fever"
    cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1');

    // 2. Remove adjacent duplicate phrases (3-30 chars), e.g. "headache since 2 days headache since 2 days" -> "headache since 2 days"
    cleaned = cleaned.replace(/\b([\w\s]{3,30})\s+\1\b/gi, '$1');

    // 3. Collapse multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned;
}

/**
 * Merge existing transcript base with new session speech chunk without duplicating overlapping words
 */
export function mergeTranscript(baseText, newSegment) {
    const base = (baseText || '').trim();
    const incoming = (newSegment || '').trim();

    if (!base) return deduplicateText(incoming);
    if (!incoming) return deduplicateText(base);

    // If incoming is already trailing substring of base, return deduplicated base
    if (base.toLowerCase().endsWith(incoming.toLowerCase())) {
        return deduplicateText(base);
    }

    const baseWords = base.split(/\s+/);
    const incomingWords = incoming.split(/\s+/);

    let maxOverlap = 0;
    const maxCheck = Math.min(baseWords.length, incomingWords.length);

    for (let len = 1; len <= maxCheck; len++) {
        const suffix = baseWords.slice(-len).join(' ').toLowerCase();
        const prefix = incomingWords.slice(0, len).join(' ').toLowerCase();
        if (suffix === prefix) {
            maxOverlap = len;
        }
    }

    let merged = '';
    if (maxOverlap > 0) {
        const newWords = incomingWords.slice(maxOverlap);
        merged = newWords.length > 0 ? `${base} ${newWords.join(' ')}` : base;
    } else {
        merged = `${base} ${incoming}`;
    }

    return deduplicateText(merged);
}

export default function useSpeechRecognition(language = 'English') {
    const [transcript, setTranscript] = useState('');
    const [interimText, setInterimText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const shouldListenRef = useRef(false);
    const baseTranscriptRef = useRef('');
    const currentTranscriptRef = useRef('');

    useEffect(() => {
        const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
        setIsSupported(!!SpeechRecognition);
    }, []);

    // Mobile mic hardware stream warmup
    const warmupMicrophone = async () => {
        if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return true;
        try {
            if (!mediaStreamRef.current) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    }
                });
                mediaStreamRef.current = stream;
            }
            return true;
        } catch (err) {
            console.warn('[Speech] Mobile mic stream warmup note:', err);
            return false;
        }
    };

    const initRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        const langCode = LANGUAGE_MAP[language];

        // If Auto-Detect or unspecified, default to navigator language or empty for browser auto-detect
        if (langCode !== undefined && langCode !== '') {
            recognition.lang = langCode;
        } else if (typeof navigator !== 'undefined' && navigator.language) {
            recognition.lang = navigator.language;
        }

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            let sessionFinal = '';
            let sessionInterim = '';

            for (let i = 0; i < event.results.length; i++) {
                const res = event.results[i];
                if (res.isFinal) {
                    sessionFinal += res[0].transcript + ' ';
                } else {
                    sessionInterim += res[0].transcript;
                }
            }

            const combinedFinal = mergeTranscript(baseTranscriptRef.current, sessionFinal);
            currentTranscriptRef.current = combinedFinal;
            setTranscript(combinedFinal);
            setInterimText(deduplicateText(sessionInterim));
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                console.log('[Speech] Silence detected, session continuing...');
                return;
            }
            if (event.error === 'aborted') return;

            if (event.error === 'audio-capture') {
                setError('Microphone not found. Please check your device audio settings.');
                shouldListenRef.current = false;
                setIsListening(false);
            } else if (event.error === 'not-allowed') {
                setError('Microphone permission denied. Please allow microphone access in browser settings.');
                shouldListenRef.current = false;
                setIsListening(false);
            } else {
                console.warn('[Speech] Recognition event notice:', event.error);
            }
        };

        recognition.onend = () => {
            setInterimText('');
            // Save current final text into base before restarting session
            baseTranscriptRef.current = currentTranscriptRef.current;

            // Mobile Auto-Restart on silence timeout
            if (shouldListenRef.current) {
                console.log('[Speech] Mobile auto-restarting continuous recording...');
                setTimeout(() => {
                    if (shouldListenRef.current) {
                        try {
                            const newRec = initRecognition();
                            if (newRec) {
                                recognitionRef.current = newRec;
                                newRec.start();
                            }
                        } catch (err) {
                            console.warn('[Speech] Auto-restart retry notice:', err);
                            setIsListening(false);
                        }
                    }
                }, 150);
            } else {
                setIsListening(false);
            }
        };

        return recognition;
    }, [language]);

    const startListening = useCallback(async (initialText = '') => {
        const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
            return;
        }

        setError(null);
        const cleanedInitial = (initialText || '').trim();
        baseTranscriptRef.current = cleanedInitial;
        currentTranscriptRef.current = cleanedInitial;
        setTranscript(cleanedInitial);
        setInterimText('');
        shouldListenRef.current = true;

        // Warm up mobile mic stream
        await warmupMicrophone();

        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
        }

        const recognition = initRecognition();
        if (recognition) {
            recognitionRef.current = recognition;
            try {
                recognition.start();
            } catch (err) {
                console.error('[Speech] Start error:', err);
                setError('Failed to start microphone. Please tap record button again.');
                setIsListening(false);
                shouldListenRef.current = false;
            }
        }
    }, [initRecognition]);

    const stopListening = useCallback(() => {
        shouldListenRef.current = false;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {}
            recognitionRef.current = null;
        }
        if (mediaStreamRef.current) {
            try {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            } catch (e) {}
            mediaStreamRef.current = null;
        }
        setIsListening(false);
        setInterimText('');
    }, []);

    useEffect(() => {
        return () => {
            shouldListenRef.current = false;
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
            if (mediaStreamRef.current) {
                try {
                    mediaStreamRef.current.getTracks().forEach(track => track.stop());
                } catch (e) {}
                mediaStreamRef.current = null;
            }
        };
    }, []);

    return {
        transcript,
        interimText,
        isListening,
        error,
        isSupported,
        startListening,
        stopListening,
        setTranscript,
    };
}

