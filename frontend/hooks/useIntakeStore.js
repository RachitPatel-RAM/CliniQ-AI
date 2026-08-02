// CliniQ AI — Zustand State Store for Intake Flow
import { create } from 'zustand';

const useIntakeStore = create((set, get) => ({
    // Step tracking
    currentStep: 1,

    // Language selection
    selectedLanguage: '',
    languageCode: '',

    // Patient details
    patient: {
        name: '',
        age: '',
        gender: '',
        language: '',
    },

    // Voice intake
    transcript: '',
    isRecording: false,

    // AI analysis result
    aiResult: null,
    isAnalyzing: false,
    analysisError: null,

    // Firebase report ID
    reportId: null,

    // Actions
    setLanguage: (language, code) => set({
        selectedLanguage: language,
        languageCode: code,
        patient: { ...get().patient, language },
        currentStep: 2,
    }),

    setPatient: (patientData) => set({
        patient: { ...get().patient, ...patientData },
        currentStep: 3,
    }),

    setTranscript: (transcript) => set({ transcript }),
    setIsRecording: (isRecording) => set({ isRecording }),

    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    setAnalysisError: (error) => set({ analysisError: error }),

    setAiResult: (result) => set({
        aiResult: result,
        isAnalyzing: false,
        analysisError: null,
        currentStep: 4,
    }),

    setReportId: (reportId) => set({ reportId }),

    // Update a specific field in the AI result (for editing)
    updateAiField: (field, value) => set((state) => ({
        aiResult: state.aiResult ? { ...state.aiResult, [field]: value } : null,
    })),

    // Reset entire flow
    reset: () => set({
        currentStep: 1,
        selectedLanguage: '',
        languageCode: '',
        patient: { name: '', age: '', gender: '', language: '' },
        transcript: '',
        isRecording: false,
        aiResult: null,
        isAnalyzing: false,
        analysisError: null,
        reportId: null,
    }),
}));

export default useIntakeStore;
