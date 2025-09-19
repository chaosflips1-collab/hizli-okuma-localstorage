// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-J4OYsV31M5VFFd4lLUIyK5NSshLla6c",
  authDomain: "hizliokumaappyeni.firebaseapp.com",
  projectId: "hizliokumaappyeni",
  storageBucket: "hizliokumaappyeni.appspot.com", // ✅ düzeltilmiş
  messagingSenderId: "485965025121",
  appId: "1:485965025121:web:bc66ed954c5d213b247f20",
  measurementId: "G-FL4KTV7R2T"
};

// Firebase başlat
const app = initializeApp(firebaseConfig);

// Firestore referansı
const db = getFirestore(app);

export { db };
