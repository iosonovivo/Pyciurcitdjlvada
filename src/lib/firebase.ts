import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAABUj2ab52UilAY8ogFfnxrqrce_8h_-E",
  authDomain: "zippy-sequence-1pt51.firebaseapp.com",
  projectId: "zippy-sequence-1pt51",
  storageBucket: "zippy-sequence-1pt51.firebasestorage.app",
  messagingSenderId: "292163530164",
  appId: "1:292163530164:web:cdb0201d6823cc8dd516e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific custom database ID
export const db = initializeFirestore(app, {}, "ai-studio-efcc7c98-ca5e-4b37-8be8-e9839a5c7680");

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut };
