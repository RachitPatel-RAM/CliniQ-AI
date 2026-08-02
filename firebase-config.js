// Firebase Configuration & Service Initialization for CliniQ AI
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    onSnapshot, 
    query, 
    orderBy, 
    limit, 
    serverTimestamp,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQb_Foqpx1d07aSuQ43RhtQBjOC3jeUsI",
  authDomain: "cliniqai-2e8a7.firebaseapp.com",
  projectId: "cliniqai-2e8a7",
  storageBucket: "cliniqai-2e8a7.firebasestorage.app",
  messagingSenderId: "532095442017",
  appId: "1:532095442017:web:6365cf60ac7f6f94b99e20",
  measurementId: "G-H62NMQPEWW"
};

// Initialize Firebase App & Analytics
const app = initializeApp(firebaseConfig);
let analytics = null;

try {
    analytics = getAnalytics(app);
    console.log("🔥 Firebase Analytics Initialized");
} catch (e) {
    console.warn("Firebase Analytics notice:", e.message);
}

// Initialize Firestore
const db = getFirestore(app);
console.log("🔥 Firebase Firestore Connected to Project:", firebaseConfig.projectId);

export { 
    app, 
    analytics, 
    db, 
    collection, 
    addDoc, 
    getDocs, 
    onSnapshot, 
    query, 
    orderBy, 
    limit, 
    serverTimestamp, 
    doc, 
    updateDoc 
};
