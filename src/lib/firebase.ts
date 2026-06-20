// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config (your actual project)
const firebaseConfig = {
  apiKey: "AIzaSyAI9ZNji23yjlWAKRvLQEIjRtD8dH4OVaU",
  authDomain: "wthrai.firebaseapp.com",
  projectId: "wthrai",
  storageBucket: "wthrai.firebasestorage.app",
  messagingSenderId: "1026486902377",
  appId: "1:1026486902377:web:871c1b4808195242aa0cf8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;