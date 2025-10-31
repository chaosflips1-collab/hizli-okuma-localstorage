import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./ExercisePlayer.css";

export default function ExercisePlayer({ studentCode, className }) {
  const navigate = useNavigate();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Doğru egzersiz sırası:
  const exercises = [
    { id: "takistoskop", name: "Takistoskop", path: "/takistoskop" },
    { id: "kosesel", name: "Köşesel", path: "/kosesel" },
    { id: "acili", name: "Açılı", path: "/acili" },
  ];

  // 🔹 Firestore'dan ilerlemeyi getir veya oluştur
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const ref = doc(db, "progress", studentCode);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProgress(snap.data());
          setCurrentExerciseIndex(snap.data().currentExercise || 0);
        } else {
          const initial = {
            currentDay: 1,
            currentExercise: 0,
            completedDays: [],
            lastUpdated: new Date().toISOString(),
          };
          await setDoc(ref, initial);
          setProgress(initial);
        }
      } catch (err) {
        console.error("❌ Firestore progress fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [studentCode]);

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Yükleniyor...</p>;

  const currentExercise = exercises[currentExerciseIndex];

  if (!currentExercise) {
    return (
      <div style={{ textAlign: "center", padding: "10px" }}>
        <p>🎉 Tüm egzersizleri tamamladın!</p>
        <p>Yarın yeni egzersizlerle devam edebilirsin 🚀</p>
      </div>
    );
  }

  // 🔹 Egzersizi başlat
  const handleStartExercise = () => {
    navigate(currentExercise.path, { state: { studentCode, className } });
  };

  // 🔹 Egzersiz tamamlandığında ilerleme kaydet
  const completeExercise = async () => {
    try {
      const ref = doc(db, "progress", studentCode);
      const nextIndex = currentExerciseIndex + 1;

      if (nextIndex >= exercises.length) {
        const updated = {
          ...progress,
          currentDay: progress.currentDay + 1,
          currentExercise: 0,
          completedDays: [...(progress.completedDays || []), progress.currentDay],
          lastUpdated: new Date().toISOString(),
        };
        await setDoc(ref, updated, { merge: true });
        setProgress(updated);
        setCurrentExerciseIndex(0);
        alert(`🎉 Tebrikler! ${progress.currentDay}. günü tamamladın!`);
      } else {
        const updated = {
          ...progress,
          currentExercise: nextIndex,
          lastUpdated: new Date().toISOString(),
        };
        await setDoc(ref, updated, { merge: true });
        setProgress(updated);
        setCurrentExerciseIndex(nextIndex);
      }
    } catch (err) {
      console.error("❌ Progress update failed:", err);
    }
  };

  return (
    <div className="exercise-player">
      <p>📘 Egzersiz: <strong>{currentExercise.name}</strong></p>
      <button className="start-btn" onClick={handleStartExercise}>▶ Başla</button>
      <button className="complete-btn" onClick={completeExercise}>✅ Tamamla</button>
    </div>
  );
}
