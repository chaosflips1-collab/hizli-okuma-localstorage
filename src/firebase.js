// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// .env dosyasındaki Firebase ayarlarını çeker
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// ✅ Firebase başlat
const app = initializeApp(firebaseConfig);

// ✅ Firestore referansı
const db = getFirestore(app);

// 🔥 Test fonksiyonu
// Konsolda Firestore bağlantısı çalışıyor mu diye kontrol eder
export async function testFirebase() {
  try {
    const snapshot = await getDocs(collection(db, "students"));
    console.log("✅ Firestore bağlantısı OK! Öğrenci sayısı:", snapshot.size);
  } catch (error) {
    console.error("❌ Firestore bağlantı hatası:", error);
  }
}

export { db, app };
