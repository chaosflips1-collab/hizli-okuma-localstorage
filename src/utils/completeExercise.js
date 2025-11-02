// src/utils/completeExercise.js
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * ✅ Her egzersiz tamamlandığında çağrılır.
 * - progress koleksiyonundaki currentDay & currentExercise ilerletilir.
 * - plan koleksiyonundan sıradaki egzersiz alınır.
 * - Bir günün egzersizleri tamamlanınca nextAvailableDate = yarın olarak atanır.
 * - navigate() ile otomatik geçiş yapılır.
 */
export default async function completeExercise(studentCode, className, navigate) {
  try {
    console.log(`🧩 Egzersiz tamamlandı: ${studentCode} - ${className}`);

    const progressRef = doc(db, "progress", studentCode);
    const planRef = doc(db, "plans", className);

    const [progressSnap, planSnap] = await Promise.all([
      getDoc(progressRef),
      getDoc(planRef),
    ]);

    if (!progressSnap.exists()) {
      console.error("⚠ progress kaydı bulunamadı!");
      alert("İlerleme kaydı bulunamadı!");
      navigate("/panel", { replace: true });
      return;
    }

    if (!planSnap.exists()) {
      console.error("⚠ plan kaydı bulunamadı!");
      alert("Plan kaydı bulunamadı!");
      navigate("/panel", { replace: true });
      return;
    }

    const progressData = progressSnap.data();
    const planData = planSnap.data();

    let { currentDay, currentExercise } = progressData;
    const dayKey = `day${currentDay}`;
    const exercises = planData[dayKey]?.exercises || [];

    let newExercise = currentExercise + 1;
    let newDay = currentDay;
    let completed = false;

    // 🎯 Günün son egzersizi mi?
    let dayCompleted = false;
    if (newExercise >= exercises.length) {
      newExercise = 0;
      newDay++;
      dayCompleted = true;
    }

    // 🔚 21 günlük plan bitti mi?
    if (newDay > Object.keys(planData).length) {
      completed = true;
      dayCompleted = false;
      alert("🎉 Tebrikler! 21 günlük plan tamamlandı!");
    }

    // 🔒 Eğer gün tamamlandıysa yarın tekrar açılacak
    let nextAvailableDate = progressData.nextAvailableDate || null;
    if (dayCompleted) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextAvailableDate = tomorrow.toISOString().split("T")[0];
    }

    const updatedProgress = {
      ...progressData,
      currentExercise: newExercise,
      currentDay: newDay,
      completed,
      lastUpdate: new Date(),
      nextAvailableDate,
    };

    await updateDoc(progressRef, updatedProgress);
    console.log("✅ Progress güncellendi:", updatedProgress);

    if (completed) {
      navigate("/panel", { replace: true });
      return;
    }

    // 🚀 Sıradaki egzersizi Firestore planından bul
    const nextDayKey = `day${updatedProgress.currentDay}`;
    const nextExercise = planData[nextDayKey]?.exercises?.[updatedProgress.currentExercise];

    if (dayCompleted) {
      alert("✅ Bugünkü çalışmalar tamamlandı! Yarın yeni egzersizler açılacak 🎯");
      navigate("/panel", { replace: true });
      return;
    }

    if (nextExercise) {
      navigate(`/${nextExercise.id}`, {
        state: {
          fromExercisePlayer: true,
          studentCode,
          className,
          duration: nextExercise.duration,
        },
        replace: true,
      });
    } else {
      alert("🔚 Günün egzersizleri tamamlandı!");
      navigate("/panel", { replace: true });
    }
  } catch (err) {
    console.error("🔥 completeExercise hata:", err);
    alert("Bir hata oluştu, lütfen tekrar deneyin.");
    navigate("/panel", { replace: true });
  }
}
