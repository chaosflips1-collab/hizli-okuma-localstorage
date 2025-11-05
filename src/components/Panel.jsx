import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./Panel.css";

export default function Panel() {
  const navigate = useNavigate();
  const location = useLocation();
  const studentFromLogin = location.state;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      let activeStudent = null;

      if (studentFromLogin) {
        activeStudent = studentFromLogin;
        localStorage.setItem("activeStudent", JSON.stringify(activeStudent));
      } else {
        const saved = localStorage.getItem("activeStudent");
        if (saved) {
          try { activeStudent = JSON.parse(saved); } catch { activeStudent = null; }
        }
      }

      if (!activeStudent) {
        navigate("/");
        return;
      }

      try {
        // öğrenci dokümanı
        const q = query(collection(db, "students"), where("kod", "==", activeStudent.kod));
        const snap = await getDocs(q);
        const docData = !snap.empty ? snap.docs[0].data() : activeStudent;
        setStudent(docData);

        // progress
        const progressRef = doc(db, "progress", activeStudent.kod);
        const progressSnap = await getDoc(progressRef);

        if (!progressSnap.exists()) {
          // ✅ completeExercise.js ile uyumlu minimal şema
          const newProgress = {
            currentDay: 1,
            currentExercise: 0,  // index
            completed: false,
            lastUpdate: serverTimestamp(),
            nextAvailableDate: null,
            // opsiyonel alanlar:
            streak: 0,
            completedDays: [],
            completedExercises: [],
          };

          await setDoc(progressRef, newProgress);
          setProgress(newProgress);
          setCompletedExercises(newProgress.completedExercises);
        } else {
          const data = progressSnap.data();
          setProgress(data);
          setCompletedExercises(data.completedExercises || []);
        }
      } catch (err) {
        console.error("❌ Firestore hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentFromLogin, navigate]);

  const today = new Date().toISOString().split("T")[0];
  const isLocked = progress?.nextAvailableDate && today < progress.nextAvailableDate;

  useEffect(() => {
    if (!isLocked || !progress?.nextAvailableDate) {
      setCountdown("");
      return;
    }

    const target = new Date(progress.nextAvailableDate + "T00:00:00");
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown("Egzersizler açıldı 🎉");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours} saat ${minutes} dk ${seconds} sn`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [progress?.nextAvailableDate, isLocked]);

  // ✅ Sadece yönlendiriyoruz. currentExercise alanını burada KESİNLİKLE yazmıyoruz.
  const handleExerciseStart = async (id) => {
    if (isLocked) {
      alert("🔒 Bugünkü çalışmaları tamamladın. Yarın tekrar gel 💪");
      return;
    }
    try {
      const progressRef = doc(db, "progress", student.kod);
      await updateDoc(progressRef, { lastUpdate: serverTimestamp() });
    } catch (e) {
      console.warn("progress.lastUpdate güncellenemedi (devam ediyoruz):", e);
    }
    navigate(`/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("activeStudent");
    navigate("/");
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>⏳ Yükleniyor...</p>;
  }
  if (!student || !progress) return null;

  const progressPercent = ((progress.completedDays?.length / 21) * 100).toFixed(0);

  const categories = [
    {
      id: "goz",
      title: "👁️ Göz Algılama Çalışmaları",
      exercises: [
        { name: "Takistoskop", id: "takistoskop" },
        { name: "Köşesel Görüş", id: "kosesel" },
        { name: "Açılı Görüş", id: "acili" },
      ],
      miniGame: {
        path: "/gameday1",
        unlockCondition: ["takistoskop", "kosesel", "acili"],
      },
    },
    {
      id: "dikkat",
      title: "🎯 Dikkat ve Konsantrasyon Çalışmaları",
      exercises: [
        { name: "Çift Taraflı Odak", id: "cifttarafliodak" },
        { name: "Harf Bulma Odak Çalışması", id: "harfbulmaodakcalismasi" },
        { name: "Odaklanma Çalışması", id: "odaklanma" },
        { name: "Hafıza Geliştirme Çalışması", id: "hafizagelistirmecalismasi" },
      ],
      miniGame: {
        path: "/gameday2",
        unlockCondition: [
          "cifttarafliodak",
          "harfbulmaodakcalismasi",
          "odaklanma",
          "hafizagelistirmecalismasi",
        ],
      },
    },
    {
      id: "kas",
      title: "💪 Göz Kaslarını Geliştirme Çalışmaları",
      exercises: [
        { name: "Göz Oyunu", id: "gozoyunu" },
        { name: "Büyüyen Şekil", id: "buyuyensekil" },
        { name: "Genişleyen Kutular", id: "genisleyenkutular" },
      ],
      miniGame: {
        path: "/gameday3",
        unlockCondition: ["gozoyunu", "buyuyensekil", "genisleyenkutular"],
      },
    },
    {
      id: "hizli",
      title: "📚 Hızlı Okuma ve Okuduğunu Anlama Çalışması",
      exercises: [
        { name: "Blok Okuma", id: "blokokuma" },
        { name: "Hızlı Okuma", id: "hizliokuma" },
      ],
    },
  ];

  return (
    <div className="panel-container">
      <h1>🎉 Hoş geldin {student.ad} {student.soyad}!</h1>

      <div className="student-card">
        <p>👤 {student.ad} {student.soyad}</p>
        <p>📚 {student.sinif}</p>
        <p>🆔 {student.kod}</p>
      </div>

      <div className="progress-box">
        <p>
          📅 Gün: {progress.currentDay} / 21 <br />
          🔥 Seri: {progress.streak || 0} gün <br />
          Tamamlanan Günler: {progress.completedDays?.length || 0}/21
        </p>
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 100 ? "#00c853" : "#1976d2",
            }}
          />
        </div>
      </div>

      {isLocked && (
        <div className="locked-info">
          🔒 Bugünkü egzersizleri tamamladın! <br />
          Yarın ({progress.nextAvailableDate}) tekrar gel 🎯
          <br />
          <span style={{ fontSize: "1rem", color: "#555" }}>
            ⏳ Yeni egzersizlerin açılmasına: {countdown}
          </span>
        </div>
      )}

      <button className="logout-btn" onClick={handleLogout}>
        🚪 Çıkış Yap
      </button>

      {!isLocked && (
        <>
          <h2 className="exercise-title">🚀 Çalışma Konuları</h2>
          {categories.map((cat) => (
            <div key={cat.id} className="accordion">
              <div
                className="accordion-header"
                onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
              >
                <h3>{cat.title}</h3>
                <span>{openCategory === cat.id ? "▲" : "▼"}</span>
              </div>

              {openCategory === cat.id && (
                <div className="accordion-content">
                  <ul>
                    {cat.exercises.map((ex) => (
                      <li key={ex.id}>
                        <button
                          className="exercise-btn"
                          onClick={() => handleExerciseStart(ex.id)}
                          disabled={completedExercises.includes(ex.id)}
                          style={{
                            backgroundColor: completedExercises.includes(ex.id) ? "#81c784" : "#4caf50",
                          }}
                        >
                          {completedExercises.includes(ex.id)
                            ? `✔ ${ex.name} Tamamlandı`
                            : `${ex.name} Başla ▶️`}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* 🎮 Mini Oyun Alanı */}
                  {cat.miniGame && (
                    <div className="mini-game-box">
                      <h4>🎮 Mini Oyun</h4>
                      {student.kod === "1234" ||
                      cat.miniGame.unlockCondition.every((id) => completedExercises.includes(id)) ? (
                        <button onClick={() => navigate(cat.miniGame.path)} className="mini-game-btn">
                          🚀 Oyunu Başlat
                        </button>
                      ) : (
                        <p className="mini-game-info">
                          🔒 Bu oyun, tüm egzersizler tamamlandıktan sonra aktif hale gelecektir.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
