// src/utils/completeExercise.js
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// 🔹 21 günlük plan sıralaması (örnek mantık)
const plan = [
  ["takistoskop", "kosesel", "acili"],
  ["cifttarafliodak", "harfbulmaodakcalismasi", "odaklanma", "hafizagelistirmecalismasi"],
  ["gozoyunu", "buyuyensekil", "genisleyenkutular"],
  ["blokokuma", "hizliokuma"],
];

export default async function completeExercise(studentCode, navigate) {
  if (!studentCode) {
    console.warn("❌ Öğrenci kodu bulunamadı. Login kontrol et.");
    return;
  }

  const ref = doc(db, "progress", studentCode);
  const snap = await getDoc(ref);

  let currentDay = 1;
  let completedExercises = [];
  let lockedDays = {};

  if (snap.exists()) {
    const data = snap.data();
    currentDay = data.currentDay || 1;
    completedExercises = data.completedExercises || [];
    lockedDays = data.lockedDays || {};
  } else {
    await setDoc(ref, { currentDay: 1, completedExercises: [], lockedDays: {} });
  }

  const dayExercises = plan[(currentDay - 1) % plan.length];
  const currentExerciseIndex = completedExercises.length;

  // ✅ Egzersiz tamamlandı
  const updatedExercises = [...completedExercises, dayExercises[currentExerciseIndex]];
  await updateDoc(ref, { completedExercises: updatedExercises });

  // 🔒 Gün bitti mi?
  if (updatedExercises.length >= dayExercises.length) {
    const nextDay = currentDay + 1;
    lockedDays[currentDay] = true;

    await updateDoc(ref, {
      currentDay: nextDay,
      completedExercises: [],
      lockedDays,
      completed: nextDay > 21,
    });

    alert(`🎉 ${currentDay}. gün tamamlandı! ${nextDay <= 21 ? nextDay + ". güne geçebilirsin!" : "Tüm plan bitti!"}`);
    setTimeout(() => navigate("/panel"), 400);
    return;
  }

  // ➡ sıradaki egzersize yönlendir
  const nextExercise = dayExercises[currentExerciseIndex + 1];
  if (nextExercise) {
    setTimeout(() => navigate(`/${nextExercise}`), 400);
  }
}
