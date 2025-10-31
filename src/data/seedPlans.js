// src/data/seedPlans.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcf0IvRdpb_QjHR_kjpG55S7jZ4wWllVk",
  authDomain: "hizli-okuma-app-d5d8c.firebaseapp.com",
  projectId: "hizli-okuma-app-d5d8c",
  storageBucket: "hizli-okuma-app-d5d8c.firebasestorage.app",
  messagingSenderId: "253492531255",
  appId: "1:253492531255:web:b8bbf0427cf7d8ccf3efb2",
  measurementId: "G-1CFVNTCQ5L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const generatePlan = () => {
  const plan = {};
  const day1 = [
    { id: "takistoskop", duration: 240 },
    { id: "kosesel", duration: 240 },
    { id: "acili", duration: 240 },
  ];
  const day2 = [
    { id: "cifttarafliodak", duration: 240 },
    { id: "harfbulmaodak", duration: 240 },
    { id: "odaklanma", duration: 240 },
    { id: "hafizagelistirme", duration: 240 },
  ];
  const day3 = [
    { id: "gozoyunu", duration: 240 },
    { id: "buyuyensekil", duration: 240 },
    { id: "genisleyenkutular", duration: 240 },
  ];
  const day4 = [
    { id: "blokokuma", duration: 240 },
    { id: "hizliokuma", duration: 240 },
  ];

  const allDays = [day1, day2, day3, day4];
  for (let i = 1; i <= 21; i++) {
    plan[`day${i}`] = { exercises: allDays[(i - 1) % 4] };
  }

  return plan;
};

const classes = ["5A", "5B", "6A", "6B", "7A", "7B", "8A", "8B"];

const uploadPlan = async () => {
  const planData = generatePlan();

  for (const className of classes) {
    try {
      const ref = doc(db, "plans", className);
      await setDoc(ref, planData, { merge: true });
      console.log(`✅ ${className} için plan başarıyla yüklendi.`);
    } catch (error) {
      console.error(`❌ ${className} için yükleme hatası:`, error);
    }
  }

  console.log("🎉 Tüm sınıflar için planlar oluşturuldu!");
};

// 🔹 Öğrenciler için başlangıç progress kaydı oluştur
const createInitialProgress = async () => {
  try {
    const studentsSnap = await getDocs(collection(db, "students"));
    for (const docSnap of studentsSnap.docs) {
      const student = docSnap.data();
      const progressRef = doc(db, "progress", student.kod);

      const progressData = {
        studentCode: student.kod,
        className: student.sinif,
        currentDay: 1,
        currentExercise: 0,
        completed: false,
        lastUpdate: new Date(),
      };

      await setDoc(progressRef, progressData, { merge: true });
      console.log(`📘 ${student.kod} (${student.sinif}) için başlangıç kaydı oluşturuldu.`);
    }

    console.log("✅ Tüm öğrenciler için progress başlangıçları oluşturuldu!");
  } catch (error) {
    console.error("❌ Progress oluşturma hatası:", error);
  }
};

// 🔥 Çalıştır
(async () => {
  await uploadPlan();
  await createInitialProgress();
})();
