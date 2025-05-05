// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBV4mdN8DYzwi1vC_NvS23rhVwuwyMyFhM",
  authDomain: "streetradar-df037.firebaseapp.com",
  projectId: "streetradar-df037",
  storageBucket: "streetradar-df037.firebasestorage.app",
  messagingSenderId: "781272457528",
  appId: "1:781272457528:web:c22ac2a47c8e55738ce1cd",
  measurementId: "G-XPRNFGBD1D"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

const analytics = getAnalytics(FIREBASE_APP);