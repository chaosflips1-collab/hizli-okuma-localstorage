// src/data/seedPlans.js
// Bu dosya sadece "seed" amaçlıdır. İşini bitirince projeden import etmeyin.
// (Tek seferlik çalıştırın → planları ve progress başlangıçlarını oluşturur.)

import { db } from "../firebase";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import createPlan from "../utils/createPlan";

// Planı basacağımız sınıflar
const classes = ["5A", "5B", "6A", "6B", "7A", "7B", "8A", "8B"];

/**
 * Her sınıf için createPlan() çağırır.
 * createPlan: 4 günlük pattern’i 21 güne döngüyle dağıtır ve router id’leriyle UYUMLU yazar.
 */
const uploadPlan = async () => {
  for (const className of classes) {
    try {
      await createPlan(className);
      console.log(`✅ ${className} için plan oluşturuldu.`);
    } catch (err) {
      console.error(`❌ ${className} plan hatası:`, err);
    }
  }
  console.log("🎉 Tüm sınıflar için planlar hazır!");
};

/**
 * Mevcut students koleksiyonundaki her öğrenci için başlangıç progress kaydı oluşturur.
 * - currentDay: 1
 * - currentExercise: 0
 * - completed: false
 */
const createInitialProgress = async () => {
  try {
    const studentsSnap = await getDocs(collection(db, "students"));
    for (const docSnap of studentsSnap.docs) {
      const student = docSnap.data();

      // Beklenen alan isimleri: student.kod, student.sinif
      const studentCode = String(student.kod || "").trim();
      const className = String(student.sinif || "").trim();

      if (!studentCode || !className) {
        console.warn("⚠️ Eksik öğrenci alanı, atlandı:", student);
        continue;
      }

      const progressRef = doc(db, "progress", studentCode);
      const progressData = {
        studentCode,
        className,
        currentDay: 1,
        currentExercise: 0,
        completed: false,
        lastUpdate: new Date(),
      };

      await setDoc(progressRef, progressData, { merge: true });
      console.log(`📘 ${studentCode} (${className}) için başlangıç progress yazıldı.`);
    }

    console.log("✅ Tüm öğrenciler için progress başlangıçları oluşturuldu!");
  } catch (error) {
    console.error("❌ Progress oluşturma hatası:", error);
  }
};

// 🚀 ÇALIŞTIR (tek seferlik)
// Not: Bu dosyayı projeye import ederseniz her açılışta çalışır. Öneri:
// - Geçici bir admin butonundan çağırın veya
// - Bir kere console'dan (devtools) import edip çalıştırın.
(async () => {
  await uploadPlan();
  await createInitialProgress();
})();
