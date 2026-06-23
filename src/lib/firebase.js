import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB0X5q_WLv4PtMTjEIzuh4PrTmzAhr6Ls8",
  authDomain: "legalconnecto.firebaseapp.com",
  projectId: "legalconnecto",
  storageBucket: "legalconnecto.firebasestorage.app",
  messagingSenderId: "1013297555390",
  appId: "1:1013297555390:web:a656717abee44ff9d8fbef",
  measurementId: "G-YDQ1K46XQK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

auth.useDeviceLanguage();
