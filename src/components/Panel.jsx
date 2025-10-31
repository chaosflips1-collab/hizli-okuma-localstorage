import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import ExercisePlayer from "../components/ExercisePlayer";
import "./Panel.css";

export default function Panel() {
  const navigate = useNavigate();
  const location = useLocation();
  const studentFromLogin = location.state;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [totalExercises] = useState(3); // sadece 3 egzersiz (takistoskop, köşesel, açılı)

  useEffect(() => {
    const fetchStudent = async () => {
      let activeStudent = null;

      if (studentFromLogin) {
        activeStudent = studentFromLogin;
        localStorage.setItem("activeStudent", JSON.stringify(activeStudent));
      } else {
        const saved = localStorage.getItem("activeStudent");
        if (saved) activeStudent = JSON.parse(saved);
      }

      if (!activeStudent) {
        navigate("/");
        return;
      }

      try {
        // öğrenci kaydını kontrol et
        const q = query(collection(db, "students"), where("kod", "==", activeStudent.kod));
        const snap = await getDocs(q);

        if (snap.empty) {
          // öğrenci firestore'da yoksa ekle
          await setDoc(doc(db, "students", activeStudent.kod), {
            ad: activeStudent.ad,
            soyad: activeStudent.soyad,
            sinif: activeStudent.sinif,
            kod: activeStudent.kod,
            lastLogin: new Date().toISOString(),
          });
        }

        setStudent(activeStudent);

        // ilerleme bilgisi al
        const progressRef = doc(db, "progress", activeStudent.kod);
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          setProgress(progressSnap.data());
        } else {
          // yoksa yeni oluştur
          const newProgress = {
            currentDay: 1,
            currentExercise: 0,
            completedDays: [],
            lastUpdated: new Date().toISOString(),
          };
          await setDoc(progressRef, newProgress);
          setProgress(newProgress);
        }
      } catch (err) {
        console.error("❌ Firestore hata:", err);
        setStudent(activeStudent);
      }

      setLoading(false);
    };

    fetchStudent();
  }, [studentFromLogin, navigate]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>⏳ Yükleniyor...</p>;
  if (!student) return null;

  const handleLogout = () => {
    localStorage.removeItem("activeStudent");
    navigate("/");
  };

  // 🎯 Egzersiz listesi
  const exercises = [
    { id: "takistoskop", name: "Takistoskop", icon: "🔤", desc: "Kelimeleri hızlıca görüp tanıma çalışması", path: "/takistoskop" },
    { id: "kosesel", name: "Köşesel", icon: "👀", desc: "Aynı anda farklı köşelere odaklanma çalışması", path: "/kosesel" },
    { id: "acili", name: "Açılı", icon: "📖", desc: "Gözün farklı açılarda kelimeleri yakalaması", path: "/acili" },
  ];

  const progressRatio =
    progress && totalExercises
      ? ((progress.currentExercise / totalExercises) * 100).toFixed(0)
      : 0;

  return (
    <div className="panel-container">
      <h1>🎉 Hoş geldin {student.ad} {student.soyad}!</h1>

      <div className="student-card">
        <p>👤 {student.ad} {student.soyad}</p>
        <p>📚 {student.sinif}</p>
        <p>🆔 {student.kod}</p>
      </div>

      {/* 🎯 Öğrenci ilerlemesi */}
      {progress && (
        <div className="progress-box">
          <p>
            📅 Bugün <strong>{progress.currentDay}. gün</strong>,{" "}
            <strong>{progress.currentExercise}/{totalExercises}</strong> egzersizi tamamladın 🎯
          </p>
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressRatio}%`,
                background: progressRatio >= 100 ? "#00c853" : "#1976d2",
              }}
            ></div>
          </div>
        </div>
      )}

      <button className="logout-btn" onClick={handleLogout}>🚪 Çıkış Yap</button>

      {/* 🔥 Günlük Egzersiz */}
      <h2 className="exercise-title">📆 Günlük Egzersiz Planın</h2>
      <ExercisePlayer studentCode={student.kod} className={student.sinif} />
    </div>
  );
}
