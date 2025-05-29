// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore,   
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    Timestamp, } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBi9-7NbqeLW-sTOEprkZ2yu_1geWht__o",
    authDomain: "newwebtech-1d5e4.firebaseapp.com",
    projectId: "newwebtech-1d5e4",
    storageBucket: "newwebtech-1d5e4.firebasestorage.app",
    messagingSenderId: "632424398627",
    appId: "1:632424398627:web:bba8ed267f8effd6ce9696",
    measurementId: "G-CRBXXB3X03"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export { db, collection, addDoc, getDocs, query, where, doc, updateDoc, Timestamp };
