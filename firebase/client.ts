import { getApps, initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBHQR7kl73JzB2UM0klvSTxRDEC6GakXwM",
  authDomain: "interview-655ae.firebaseapp.com",
  projectId: "interview-655ae",
  storageBucket: "interview-655ae.firebasestorage.app",
  messagingSenderId: "625684696532",
  appId: "1:625684696532:web:c47901368a1644b1e05a41",
  measurementId: "G-C2246BXJCW"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp()
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);