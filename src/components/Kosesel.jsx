import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Kosesel.css";

export default function Kosesel() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(48);

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [letters, setLetters] = useState(["", ""]);

  const [speed] = useState(1000);
  const pool = library.letters || [];

  const generateLetters = () => [
    pool[Math.floor(Math.random() * pool.length)],
    pool[Math.floor(Math.random() * pool.length)],
  ];

  const startExercise = () => {
    setRunning(true);
    setTime(0);
    setLetters(generateLetters());
  };

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;

          if (newTime % 3 === 0) setLetters(generateLetters());

          if (newTime >= 180) {
            clearInterval(interval);
            setRunning(false);
            setTimeout(() => handleExerciseComplete(), 500);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  // ✅ Egzersiz bitince sıradaki egzersize geç
  const handleExerciseComplete = async () => {
    alert("🎯 Köşesel Egzersiz tamamlandı!");

    try {
      const progressRef = doc(db, "progress", student.kod);
      const progressSnap = await getDoc(progressRef);

      if (!progressSnap.exists()) {
        alert("İlerleme verisi bulunamadı!");
        return navigate("/panel");
      }

      const progressData = progressSnap.data();
      let { currentDay, currentExercise, plan } = progressData;
      const dayKey = `day${currentDay}`;
      const exercises = plan?.[dayKey] || [];

      let newExercise = (currentExercise || 0) + 1;
      let newDay = currentDay;
      let completed = false;

      if (newExercise >= exercises.length) {
        newExercise = 0;
        newDay++;
        if (newDay > 21) {
          completed = true;
          alert("🎉 Tebrikler! 21 günlük plan tamamlandı!");
        }
      }

      const updatedProgress = {
        ...progressData,
        currentDay: newDay,
        currentExercise: newExercise,
        completed,
        lastUpdate: new Date(),
      };

      await updateDoc(progressRef, updatedProgress);

      // sıradaki egzersizi bul
      const nextDayKey = `day${updatedProgress.currentDay}`;
      const nextExercise =
        updatedProgress.plan?.[nextDayKey]?.[updatedProgress.currentExercise];

      if (nextExercise && !completed) {
        alert("✅ Sıradaki egzersize geçiliyor...");
        navigate(`/${nextExercise.id}`, {
          state: {
            fromExercisePlayer: true,
            studentCode: student.kod,
            className: student.sinif,
            duration: nextExercise.duration,
          },
          replace: true,
        });
      } else {
        navigate("/panel", { replace: true });
      }
    } catch (err) {
      console.error("🔥 Plan ilerletme hatası:", err);
      alert("Bir hata oluştu, panel'e dönülüyor.");
      navigate("/panel", { replace: true });
    }
  };

  const exitExercise = () => {
    setRunning(false);
    setLetters(["", ""]);
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel");
  };

  return (
    <div className="kosesel-container">
      <h2 className="kosesel-title">🔲 Köşesel Çalışma 🔲</h2>

      <div className="letters-box">
        {letters.map((ltr, i) => (
          <div
            key={i}
            className="letter-card"
            style={{
              backgroundColor: bgColor,
              fontFamily: font,
              fontSize: `${fontSize}px`,
            }}
          >
            {ltr}
          </div>
        ))}
      </div>

      <div className="info-box">
        <h4>📋 Bilgi Tablosu</h4>
        <p>⏳ Kalan Süre: {180 - time} sn</p>
        <p>⚡ Hız: {speed} ms</p>
      </div>

      <div className="settings-box">
        <h4>⚙️ Ayarlar Menüsü</h4>
        <div>
          <label>Zemin Renk: </label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            disabled={running}
          />
        </div>
        <div>
          <label>Font: </label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            disabled={running}
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </div>
        <div>
          <label>Font Boyutu: </label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min="16"
            max="72"
            disabled={running}
          />
        </div>
      </div>

      <div className="buttons">
        <button className="start-btn" onClick={startExercise} disabled={running}>
          ✔ Başla
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>
    </div>
  );
}
