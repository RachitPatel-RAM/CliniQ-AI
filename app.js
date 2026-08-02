// CliniQ AI - Multilingual Intake Application Logic with Firebase Integration
import { 
    db, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    limit, 
    serverTimestamp, 
    doc, 
    updateDoc 
} from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {

    // App State Management
    const state = {
        currentView: 'view-intake-hero',
        selectedLanguage: 'Gujarati',
        languageCode: 'gu',
        symptomText: '',
        isRecording: false,
        recordingTimer: null,
        recordingSeconds: 0,
        activeDocId: null, // Firestore document ID
        patientData: {
            name: 'Robert J. Miller',
            mrn: 'MRN-992334',
            age: '49y',
            gender: 'Male',
            vitals: 'BP 154/98 • HR 102',
            language: 'Gujarati',
            chiefComplaint: '',
            symptoms: [],
            isHighRisk: true
        }
    };

    // DOM Element References
    const navButtons = document.querySelectorAll('.nav-btn');
    const viewPanels = document.querySelectorAll('.view-panel');
    const startFlowBtns = document.querySelectorAll('.start-flow-btn');
    const demoTriggerBtns = document.querySelectorAll('.demo-trigger-btn');
    const langCards = document.querySelectorAll('.lang-card');
    
    // Intake Form Elements
    const voiceRecordBtn = document.getElementById('voice-record-btn');
    const voiceIcon = document.getElementById('voice-icon');
    const voiceBtnLabel = document.getElementById('voice-btn-label');
    const voiceRecordingStatus = document.getElementById('voice-recording-status');
    const voiceTimer = document.getElementById('voice-timer');
    const symptomInput = document.getElementById('symptom-input');
    const charBar = document.getElementById('char-bar');
    const charCounter = document.getElementById('char-counter');
    const analyzeSubmitBtn = document.getElementById('analyze-submit-btn');
    const symptomChips = document.querySelectorAll('.symptom-chip');
    const exampleBtns = document.querySelectorAll('.example-btn');
    const selectedLanguageBadge = document.getElementById('selected-language-badge');

    // Analysis View Elements
    const terminalLogs = document.getElementById('terminal-logs');
    const countdownVal = document.getElementById('countdown-val');
    const skipAnalysisBtn = document.getElementById('skip-analysis-btn');

    // Summary View Elements
    const summaryPatientName = document.getElementById('summary-patient-name');
    const summaryMrn = document.getElementById('summary-mrn');
    const summaryAge = document.getElementById('summary-age');
    const summaryLanguage = document.getElementById('summary-language');
    const summaryChiefComplaint = document.getElementById('summary-chief-complaint');
    const confirmSummaryBtn = document.getElementById('confirm-summary-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');

    // View Navigation Logic
    function switchView(targetViewId) {
        state.currentView = targetViewId;
        
        viewPanels.forEach(panel => {
            if (panel.id === targetViewId) {
                panel.classList.remove('hidden');
                panel.classList.add('block');
            } else {
                panel.classList.remove('block');
                panel.classList.add('hidden');
            }
        });

        // Update active sidebar button
        navButtons.forEach(btn => {
            const path = btn.dataset.view;
            if (
                (targetViewId.includes('hero') || targetViewId.includes('step')) && path === 'patient-intake' ||
                targetViewId === 'view-dashboard' && path === 'dashboard'
            ) {
                btn.className = 'nav-btn flex items-center w-full px-4 py-3 rounded-xl text-sm font-semibold bg-primary-container text-on-primary-container shadow-sm transition-all group';
            } else {
                btn.className = 'nav-btn flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all group';
            }
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Attach Nav Clicks
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.view;
            if (target === 'patient-intake') {
                switchView('view-intake-hero');
            } else if (target === 'dashboard') {
                switchView('view-dashboard');
            } else {
                alert(`The ${target} module is accessible via the intake pipeline.`);
            }
        });
    });

    // Start Flow Buttons
    startFlowBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView('view-step-language');
        });
    });

    // Demo Trigger Buttons
    demoTriggerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loadDemoPreset();
        });
    });

    // Language Selection Card Handler
    langCards.forEach(card => {
        card.addEventListener('click', () => {
            const lang = card.dataset.lang;
            const code = card.dataset.code;
            state.selectedLanguage = lang;
            state.languageCode = code;

            if (selectedLanguageBadge) {
                selectedLanguageBadge.innerText = `Language: ${lang}`;
            }
            const recLangEl = document.getElementById('recording-language-name');
            if (recLangEl) recLangEl.innerText = lang;

            switchView('view-step-narrative');
        });
    });

    // Character Counter & Input Handler
    if (symptomInput) {
        symptomInput.addEventListener('input', () => {
            const text = symptomInput.value;
            state.symptomText = text;
            const length = text.length;

            if (charCounter) {
                charCounter.innerText = `${length} / 2000 chars`;
            }
            if (charBar) {
                const percent = Math.min((length / 2000) * 100, 100);
                charBar.style.width = `${percent}%`;
            }
        });
    }

    // Quick Add Symptom Chips
    symptomChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const tag = chip.innerText.replace('+', '').trim();
            if (!symptomInput.value.includes(tag)) {
                symptomInput.value += (symptomInput.value ? ', ' : '') + tag;
                symptomInput.dispatchEvent(new Event('input'));
            }
        });
    });

    // Example Presets
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const italicText = btn.querySelector('p')?.innerText.replace(/"/g, '') || '';
            if (symptomInput) {
                symptomInput.value = italicText;
                symptomInput.dispatchEvent(new Event('input'));
            }
        });
    });

    // Voice Recording Simulator
    if (voiceRecordBtn) {
        voiceRecordBtn.addEventListener('click', () => {
            if (!state.isRecording) {
                // Start Recording
                state.isRecording = true;
                if (voiceIcon) voiceIcon.innerText = 'mic_off';
                if (voiceBtnLabel) voiceBtnLabel.innerText = 'Stop Recording';
                if (voiceRecordingStatus) voiceRecordingStatus.classList.remove('hidden');
                voiceRecordBtn.classList.add('bg-error', 'text-white');

                state.recordingSeconds = 0;
                state.recordingTimer = setInterval(() => {
                    state.recordingSeconds++;
                    const mins = String(Math.floor(state.recordingSeconds / 60)).padStart(2, '0');
                    const secs = String(state.recordingSeconds % 60).padStart(2, '0');
                    if (voiceTimer) voiceTimer.innerText = `${mins}:${secs}`;

                    // Simulate Speech to Text appending
                    if (state.recordingSeconds === 2) {
                        symptomInput.value = "મને બે દિવસથી છાતીમાં ભારે દુખાવો થાય છે...";
                        symptomInput.dispatchEvent(new Event('input'));
                    } else if (state.recordingSeconds === 4) {
                        symptomInput.value += " અને ડાબા હાથ અને જડબા તરફ દુખાવો ફેલાય છે. સાથે ગભરામણ થાય છે.";
                        symptomInput.dispatchEvent(new Event('input'));
                    }
                }, 1000);

            } else {
                // Stop Recording
                state.isRecording = false;
                clearInterval(state.recordingTimer);
                if (voiceIcon) voiceIcon.innerText = 'mic';
                if (voiceBtnLabel) voiceBtnLabel.innerText = 'Record Voice';
                if (voiceRecordingStatus) voiceRecordingStatus.classList.add('hidden');
                voiceRecordBtn.classList.remove('bg-error', 'text-white');
            }
        });
    }

    // Submit for Analysis
    if (analyzeSubmitBtn) {
        analyzeSubmitBtn.addEventListener('click', () => {
            if (!symptomInput.value.trim()) {
                alert('Please enter or record patient symptoms before running AI analysis.');
                return;
            }
            startAnalysisPipeline();
        });
    }

    // AI Analysis Simulation & Firebase Sync
    let analysisTimer = null;
    function startAnalysisPipeline() {
        switchView('view-step-analyzing');

        const steps = [
            { id: 'step-1', duration: 1000, log: `[NLP] Parsing ${state.selectedLanguage} transcript & colloquialisms...` },
            { id: 'step-2', duration: 1000, log: `[ENTITIES] Identified chief complaint: "substernal chest pain", severity: "8/10"` },
            { id: 'step-3', duration: 1000, log: `[SOAP] Mapping narrative into Subjective/Objective structures...` },
            { id: 'step-4', duration: 1000, log: `[TRIAGE_FLAG] CRITICAL: Suspected Acute Coronary Syndrome. Flagging EKG priority!` }
        ];

        let currentIdx = 0;
        let countdown = 4;

        if (terminalLogs) {
            terminalLogs.innerHTML = `<div class="text-slate-500">> Initiating Gemma fine-tuned clinical triage pipeline...</div>`;
        }

        const runNextStep = () => {
            if (currentIdx < steps.length) {
                const s = steps[currentIdx];
                const stepEl = document.getElementById(s.id);
                if (stepEl) {
                    stepEl.classList.remove('opacity-40');
                    stepEl.classList.add('opacity-100');
                    const bar = stepEl.querySelector('.step-bar');
                    if (bar) bar.style.width = '100%';
                    const icon = stepEl.querySelector('.step-icon');
                    if (icon) {
                        icon.classList.remove('bg-surface-container-highest');
                        icon.classList.add('bg-primary', 'text-white');
                        icon.innerText = '✓';
                    }
                }

                if (terminalLogs) {
                    const logDiv = document.createElement('div');
                    logDiv.className = 'text-emerald-400 font-medium';
                    logDiv.innerText = s.log;
                    terminalLogs.appendChild(logDiv);
                    terminalLogs.scrollTop = terminalLogs.scrollHeight;
                }

                currentIdx++;
                countdown--;
                if (countdownVal) countdownVal.innerText = `00:0${Math.max(countdown, 0)}`;

                analysisTimer = setTimeout(runNextStep, 1000);
            } else {
                setTimeout(async () => {
                    populateSummaryView();
                    await saveIntakeToFirebase();
                    switchView('view-step-summary');
                }, 600);
            }
        };

        runNextStep();
    }

    if (skipAnalysisBtn) {
        skipAnalysisBtn.addEventListener('click', async () => {
            if (analysisTimer) clearTimeout(analysisTimer);
            populateSummaryView();
            await saveIntakeToFirebase();
            switchView('view-step-summary');
        });
    }

    // Populate Summary View Data
    function populateSummaryView() {
        const text = symptomInput ? symptomInput.value.trim() : '';

        if (summaryChiefComplaint) {
            if (text.includes('છાતીમાં') || text.includes('chest') || text.includes('દુખાવો')) {
                summaryChiefComplaint.innerText = 'Acute onset of substernal chest pressure radiating to the left jaw, accompanied by diaphoresis and mild nausea over the last 3 hours. Severity reported at 8/10.';
                state.patientData.isHighRisk = true;
            } else if (text.includes('बुखार') || text.includes('fever')) {
                summaryChiefComplaint.innerText = 'High-grade fever (102°F) accompanied by productive cough and dyspnea on exertion over 24 hours.';
                state.patientData.isHighRisk = false;
            } else {
                summaryChiefComplaint.innerText = text || 'Patient presented with localized musculoskeletal discomfort worsening with physical activity.';
                state.patientData.isHighRisk = false;
            }
        }

        if (summaryLanguage) {
            summaryLanguage.innerText = `${state.selectedLanguage} (Translated to English)`;
        }

        // Toggle Alert Card based on Risk
        const alertCard = document.getElementById('summary-alert-card');
        const priorityTag = document.getElementById('priority-tag');
        if (alertCard && priorityTag) {
            if (state.patientData.isHighRisk) {
                alertCard.classList.remove('hidden');
                priorityTag.className = 'px-3.5 py-1.5 rounded-full bg-error-container text-on-error-container flex items-center gap-2 text-xs font-bold shadow-xs';
                priorityTag.innerHTML = `<span class="material-symbols-outlined text-[18px]">priority_high</span><span class="uppercase tracking-wider">High Priority Triage Case</span>`;
            } else {
                alertCard.classList.add('hidden');
                priorityTag.className = 'px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-2 text-xs font-bold shadow-xs';
                priorityTag.innerHTML = `<span class="material-symbols-outlined text-[18px]">info</span><span class="uppercase tracking-wider">Routine Triage Case</span>`;
            }
        }
    }

    // Save Intake Record to Firebase Firestore
    async function saveIntakeToFirebase() {
        try {
            const docData = {
                patientName: state.patientData.name,
                mrn: state.patientData.mrn,
                age: state.patientData.age,
                gender: state.patientData.gender,
                vitals: state.patientData.vitals,
                language: state.selectedLanguage,
                symptomRawText: symptomInput ? symptomInput.value.trim() : '',
                chiefComplaint: summaryChiefComplaint ? summaryChiefComplaint.innerText : '',
                triagePriority: state.patientData.isHighRisk ? 'CRITICAL' : 'ROUTINE',
                isHighRisk: state.patientData.isHighRisk,
                status: 'Pending Review',
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "intakes"), docData);
            state.activeDocId = docRef.id;
            console.log("🔥 Patient Intake saved to Firebase Firestore with ID:", docRef.id);
        } catch (error) {
            console.error("Error saving intake to Firebase:", error);
        }
    }

    // Load Demo Preset directly
    function loadDemoPreset() {
        state.selectedLanguage = 'Gujarati';
        if (selectedLanguageBadge) selectedLanguageBadge.innerText = 'Language: Gujarati';
        if (symptomInput) {
            symptomInput.value = "મને બે દિવસથી છાતીમાં ભારે દુખાવો થાય છે અને ડાબા હાથ અને જડબા તરફ દુખાવો ફેલાય છે. સાથે ગભરામણ થાય છે.";
            symptomInput.dispatchEvent(new Event('input'));
        }
        startAnalysisPipeline();
    }

    // Confirmation & PDF Buttons
    if (confirmSummaryBtn) {
        confirmSummaryBtn.addEventListener('click', async () => {
            if (state.activeDocId) {
                try {
                    const docRef = doc(db, "intakes", state.activeDocId);
                    await updateDoc(docRef, {
                        status: 'Confirmed',
                        confirmedAt: serverTimestamp()
                    });
                    console.log("🔥 Updated document status in Firebase to Confirmed:", state.activeDocId);
                } catch (e) {
                    console.error("Error updating status in Firebase:", e);
                }
            }
            alert('✓ Clinical summary confirmed and dispatched to physician EMR & synced to Firebase!');
            switchView('view-dashboard');
        });
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            alert('Generating PDF report for ' + state.patientData.name + '...');
        });
    }

    // Real-Time Firebase Listener for Dashboard Queue
    function subscribeToDashboardQueue() {
        const queueTableBody = document.querySelector('#view-dashboard tbody');
        if (!queueTableBody) return;

        const q = query(collection(db, "intakes"), orderBy("createdAt", "desc"), limit(20));

        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) return;

            let html = '';
            snapshot.forEach((doc) => {
                const data = doc.data();
                const priorityBadge = data.triagePriority === 'CRITICAL' || data.isHighRisk
                    ? `<span class="px-3 py-1 bg-error-container text-error rounded-full font-bold text-[10px]">CRITICAL</span>`
                    : `<span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[10px]">ROUTINE</span>`;

                html += `
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="p-4 font-bold">${data.patientName || 'Anonymous Patient'}</td>
                    <td class="p-4 text-primary font-semibold">${data.language || 'English'}</td>
                    <td class="p-4 truncate max-w-xs">${data.chiefComplaint || data.symptomRawText || 'N/A'}</td>
                    <td class="p-4">${priorityBadge}</td>
                    <td class="p-4"><button class="view-summary-btn text-primary font-bold hover:underline" data-id="${doc.id}">View Report</button></td>
                </tr>`;
            });

            queueTableBody.innerHTML = html;
            console.log("🔥 Real-time Firebase Dashboard Queue updated (count:", snapshot.size, ")");
        }, (err) => {
            console.warn("Firestore snapshot notice:", err.message);
        });
    }

    // Subscribe to Firestore updates
    subscribeToDashboardQueue();

    // Dashboard View Summary Button Delegation
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-summary-btn')) {
            populateSummaryView();
            switchView('view-step-summary');
        }
    });

});
