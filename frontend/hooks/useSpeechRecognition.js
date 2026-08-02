// CliniQ AI — Continuous & Accurate Web Speech API Hook for Voice-to-Text
'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

const LANGUAGE_MAP = {
    'Gujarati': 'gu-IN',
    'Hindi': 'hi-IN',
    'English': 'en-US',
};

export default function useSpeechRecognition(language = 'English') {
    const [transcript, setTranscript] = useState('');
    const [interimText, setInterimText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef(null);
    const shouldListenRef = useRef(false);
    const baseTranscriptRef = useRef('');
    const currentTranscriptRef = useRef('');

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    const initRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        const selectedLangCode = LANGUAGE_MAP[language] || 'en-US';

        recognition.lang = selectedLangCode;
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

            // Iterate through all results in the current session cleanly
            // This prevents duplicate appending when onresult triggers repeatedly
            for (let i = 0; i < event.results.length; i++) {
                const res = event.results[i];
                if (res.isFinal) {
                    sessionFinal += res[0].transcript + ' ';
                } else {
                    sessionInterim += res[0].transcript;
                }
            }

            const combinedFinal = (baseTranscriptRef.current + ' ' + sessionFinal).trim();
            currentTranscriptRef.current = combinedFinal;
            setTranscript(combinedFinal);
            setInterimText(sessionInterim);
        };

        recognition.onerror = (event) => {
            // Ignore benign errors during auto-restart
            if (event.error === 'no-speech') {
                console.log('[Speech] No speech detected in segment, continuing...');
                return;
            }
            if (event.error === 'aborted') return;

            if (event.error === 'audio-capture') {
                setError('Microphone not found. Please check your microphone settings.');
                shouldListenRef.current = false;
                setIsListening(false);
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone permission.');
                shouldListenRef.current = false;
                setIsListening(false);
            } else {
                console.warn('[Speech] Recognition warning/error:', event.error);
            }
        };

        recognition.onend = () => {
            setInterimText('');
            // Save current final text into base before restarting session
            baseTranscriptRef.current = currentTranscriptRef.current;

            // Auto-restart if user did not explicitly click Stop (e.g. mobile auto-timeout)
            if (shouldListenRef.current) {
                console.log('[Speech] Session ended naturally, auto-restarting continuous recording...');
                try {
                    recognition.start();
                } catch (err) {
                    console.warn('[Speech] Auto-restart attempt failed, recreating recognition...', err);
                    setTimeout(() => {
                        if (shouldListenRef.current) {
                            const newRec = initRecognition();
                            if (newRec) {
                                recognitionRef.current = newRec;
                                try { newRec.start(); } catch (e) {}
                            }
                        }
                    }, 300);
                }
            } else {
                setIsListening(false);
            }
        };

        return recognition;
    }, [language]);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }

        // Reset transcript state
        setError(null);
        baseTranscriptRef.current = '';
        currentTranscriptRef.current = '';
        setTranscript('');
        setInterimText('');
        shouldListenRef.current = true;

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
                setError('Failed to start speech recognition. Please tap record again.');
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
        setIsListening(false);
        setInterimText('');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            shouldListenRef.current = false;
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
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
