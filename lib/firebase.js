import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyACwwT5Wy6N10koF_07osDoNSj1ZNw-XgM",
  authDomain: "together-47b85.firebaseapp.com",
  projectId: "together-47b85",
  storageBucket: "together-47b85.firebasestorage.app",
  messagingSenderId: "117400584839",
  appId: "1:117400584839:web:d46acceb8bbe1e5b4bee22",
  measurementId: "G-40DTHCFPFF"
};

// Initialize Firebase (prevent multiple initializations in Next.js development)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
