import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGB0RzhgivyQboKcpONdefV59v75Puwls",
  authDomain: "neu-library-app-eb94f.firebaseapp.com",
  projectId: "neu-library-app-eb94f",
  storageBucket: "neu-library-app-eb94f.firebasestorage.app",
  messagingSenderId: "165233031391",
  appId: "1:165233031391:web:16b223cf1c8d09c258116a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);