// CliniQ AI — Web Speech API Hook for Voice-to-Text
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
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }

        // Reset state
        setError(null);
        finalTranscriptRef.current = '';
        setTranscript('');
        setInterimText('');

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = LANGUAGE_MAP[language] || 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = finalTranscriptRef.current;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript + ' ';
                    finalTranscriptRef.current = finalTranscript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            setTranscript(finalTranscript.trim());
            setInterimText(interimTranscript);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                setError('No speech detected. Please try speaking again.');
            } else if (event.error === 'audio-capture') {
                setError('Microphone not found. Please check your microphone settings.');
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone permission.');
            } else {
                setError(`Speech recognition error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimText('');
        };

        try {
            recognition.start();
        } catch (err) {
            setError('Failed to start speech recognition.');
            setIsListening(false);
        }
    }, [language]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setInterimText('');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
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
