
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDeNZfK7CgCr2i0da0LH_LHCrofkbwEMG0",
  authDomain: "school-management-51c8b.firebaseapp.com",
  projectId: "school-management-51c8b",
  storageBucket: "school-management-51c8b.firebasestorage.app",
  messagingSenderId: "746331086396",
  appId: "1:746331086396:web:4c439362aff9a988812d39"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
