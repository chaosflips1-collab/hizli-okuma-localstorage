import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import library from "../data/library.json";
import { db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "./Takistoskop.css";

export default function Takistoskop() {
  const navigate = useNavigate();
  const location = useLocation();

  const { fromExercisePlayer, studentCode, className, duration } = location.state || {};

  const [material, setMaterial] = useState("harf");
  const [speed, setSpeed] = useState(1000);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(32);
  const [showSettings, setShowSettings] = useState(false);

  const [currentItem, setCurrentItem] = useState("");
  const [answer, setAnswer] = useState("");
  const [showItem, setShowItem] = useState(false);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [exerciseFinished, setExerciseFinished] = useState(false);

  const studentClass = localStorage.getItem("studentClass") || "6";
  const letters = library.letters || [];
  const numbers = library.numbers || [];
  const words = library.takistoskop?.[studentClass] || [];

  const getRandomItem = () => {
    if (material === "harf") return letters[Math.floor(Math.random() * letters.length)];
    if (material === "rakam") return numbers[Math.floor(Math.random() * numbers.length)];
    return words[Math.floor(Math.random() * words.length)];
  };

  const startExercise = () => {
    setRunning(true);
    setTime(0);
    setExerciseFinished(false);
    const item = getRandomItem();
    setCurrentItem(item);
    setShowItem(true);
    setTimeout(() => setShowItem(false), speed);
  };

  const checkAnswer = () => {
    if (!answer.trim()) return alert("Yanıt vermediniz!");
    if (answer.trim().toLowerCase() === currentItem.toString().toLowerCase()) {
      setCorrect((c) => c + 1);
      setScore((s) => s + 10);
      if (score + 10 > record) setRecord(score + 10);
    } else setWrong((w) => w + 1);

    setAnswer("");
    const newItem = getRandomItem();
    setCurrentItem(newItem);
    setShowItem(true);
    setTimeout(() => setShowItem(false), speed);
  };

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          if (newTime === 120) setSpeed(800);
          if (newTime === 240) setSpeed(600);
          if (newTime >= (duration || 300)) {
            clearInterval(interval);
            setRunning(false);
            setExerciseFinished(true);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, duration]);

  useEffect(() => {
    const finishAndGoNext = async () => {
      if (exerciseFinished && fromExercisePlayer && studentCode && className) {
        try {
          const progressRef = doc(db, "progress", studentCode);
          const planRef = doc(db, "plans", className);

          const [progressSnap, planSnap] = await Promise.all([
            getDoc(progressRef),
            getDoc(planRef),
          ]);

          if (progressSnap.exists() && planSnap.exists()) {
            const progressData = progressSnap.data();
            const planData = planSnap.data();

            let { currentDay, currentExercise } = progressData;
            const dayKey = `day${currentDay}`;
            const exercises = planData[dayKey]?.exercises || [];

            let newExercise = currentExercise + 1;
            let newDay = currentDay;
            let completed = false;

            if (newExercise >= exercises.length) {
              newExercise = 0;
              newDay++;
              if (newDay > Object.keys(planData).length) {
                completed = true;
                alert("🎉 Tebrikler! 21 günlük plan tamamlandı!");
              }
            }

            const updatedProgress = {
              ...progressData,
              currentExercise: newExercise,
              currentDay: newDay,
              completed,
              lastUpdate: new Date(),
            };

            await updateDoc(progressRef, updatedProgress);
            alert("✅ Egzersiz tamamlandı, sıradaki egzersize geçiliyor...");

            // 👉 Firestore kaydından sıradaki egzersizi al
            const nextDayKey = `day${updatedProgress.currentDay}`;
            const nextExercise =
              planData[nextDayKey]?.exercises?.[updatedProgress.currentExercise];

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
              navigate("/panel", { replace: true });
            }
          }
        } catch (err) {
          console.error("🔥 Plan ilerletme hatası:", err);
          alert("Bir hata oluştu, lütfen tekrar deneyin.");
          navigate("/panel", { replace: true });
        }
      } else if (exerciseFinished) {
        alert("Bugünkü Takistoskop egzersizi sona erdi!");
        navigate("/panel", { replace: true });
      }
    };

    if (exerciseFinished) finishAndGoNext();
  }, [exerciseFinished, fromExercisePlayer, studentCode, className, navigate]);

  const exitExercise = () => {
    setRunning(false);
    setCurrentItem("");
    setAnswer("");
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel", { replace: true });
  };

  return (
    <div className="takistoskop-container">
      <h2 className="takistoskop-title">🎯 Takistoskop Çalışması 🎯</h2>

      <div className="top-section">
        <div className="display-box">
          <div
            className="display-item"
            style={{
              backgroundColor: bgColor,
              fontFamily: font,
              fontSize: `${fontSize}px`,
            }}
          >
            {showItem ? currentItem : ""}
          </div>

          <div className="answer-section">
            <p>Yanıtınız?</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="answer-input"
              disabled={!running}
            />
            <button onClick={checkAnswer} className="answer-btn" disabled={!running}>
              ✅ Tamam
            </button>
          </div>
        </div>

        <div className="score-board">
          <h4>🏆 Başarı Tablosu</h4>
          <p>✔ Doğru: {correct}</p>
          <p>❌ Yanlış: {wrong}</p>
          <p>⭐ Skor: {score}</p>
          <p>🥇 Rekor: {record}</p>
          <p>⏳ Kalan Süre: {(duration || 300) - time} sn</p>
          <p>⚡ Hız: {speed} ms</p>
        </div>
      </div>

      <div className="settings-wrapper">
        <div
          className="settings-header"
          onClick={() => setShowSettings((prev) => !prev)}
        >
          ⚙️ Ayarlar Menüsü {showSettings ? "▲" : "▼"}
        </div>

        {showSettings && (
          <div className="settings-box slide-down">
            <label>Materyal:</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              disabled={running}
            >
              <option value="harf">Harf</option>
              <option value="kelime">Kelime</option>
              <option value="rakam">Rakam</option>
            </select>

            <label>Hız (ms):</label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={running}
            />
            <span>{speed} ms</span>

            <label>Zemin Renk:</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              disabled={running}
            />

            <label>Font Boyutu:</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min="16"
              max="72"
              disabled={running}
            />
          </div>
        )}
      </div>

      <div className="button-row">
        <button onClick={startExercise} className="start-btn" disabled={running}>
          ✔ Başla
        </button>
        <button onClick={exitExercise} className="exit-btn">
          ❌ Çıkış
        </button>
      </div>
    </div>
  );
}
