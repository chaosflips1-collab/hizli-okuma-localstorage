// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-J4OYsV31M5VFFd41LUtYk5NSshLla6c",
  authDomain: "hizliokumaappyeni.firebaseapp.com",
  projectId: "hizliokumaappyeni",
  storageBucket: "hizliokumaappyeni.appspot.com",
  messagingSenderId: "485965025121",
  appId: "1:485965025121:web:bc66ed954c5d213b247f20",
  measurementId: "G-FL4KTV7R2T"
};

// Firebase başlat
const app = initializeApp(firebaseConfig);

// Firestore başlat
const db = getFirestore(app);

export { db };
