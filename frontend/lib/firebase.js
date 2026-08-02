// CliniQ AI — Firebase Realtime Database Configuration
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, get, onValue, update, query, orderByChild, limitToLast } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBQb_Foqpx1d07aSuQ43RhtQBjOC3jeUsI",
    authDomain: "cliniqai-2e8a7.firebaseapp.com",
    databaseURL: "https://cliniqai-2e8a7-default-rtdb.firebaseio.com",
    projectId: "cliniqai-2e8a7",
    storageBucket: "cliniqai-2e8a7.firebasestorage.app",
    messagingSenderId: "532095442017",
    appId: "1:532095442017:web:6365cf60ac7f6f94b99e20",
    measurementId: "G-H62NMQPEWW"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Save a completed intake report to Firebase RTDB
 */
export async function saveIntakeReport(reportData) {
    const intakesRef = ref(database, 'intakes');
    const newRef = push(intakesRef);
    await set(newRef, {
        ...reportData,
        createdAt: Date.now(),
        status: 'Pending Review'
    });
    return newRef.key;
}

/**
 * Update an existing intake report
 */
export async function updateIntakeReport(reportId, updates) {
    const reportRef = ref(database, `intakes/${reportId}`);
    await update(reportRef, {
        ...updates,
        updatedAt: Date.now()
    });
}

/**
 * Confirm an intake report (mark as reviewed)
 */
export async function confirmIntakeReport(reportId) {
    const reportRef = ref(database, `intakes/${reportId}`);
    await update(reportRef, {
        status: 'Confirmed',
        confirmedAt: Date.now()
    });
}

/**
 * Subscribe to real-time intake queue updates
 * @param {Function} callback - Called with array of intake records
 * @returns {Function} Unsubscribe function
 */
export function subscribeToIntakes(callback) {
    const intakesRef = ref(database, 'intakes');
    const intakesQuery = query(intakesRef, orderByChild('createdAt'), limitToLast(50));

    const unsubscribe = onValue(intakesQuery, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            callback([]);
            return;
        }
        // Convert object to array, add id, sort descending
        const records = Object.entries(data)
            .map(([id, record]) => ({ id, ...record }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(records);
    });

    return unsubscribe;
}

/**
 * Get a single intake report by ID
 */
export async function getIntakeReport(reportId) {
    const reportRef = ref(database, `intakes/${reportId}`);
    const snapshot = await get(reportRef);
    if (snapshot.exists()) {
        return { id: reportId, ...snapshot.val() };
    }
    return null;
}

export { database };
