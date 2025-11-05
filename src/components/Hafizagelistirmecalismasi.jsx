// src/components/Hafizagelistirmecalismasi.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise";
import "./Hafizagelistirmecalismasi.css";

export default function Hafizagelistirmecalismasi() {
  const navigate = useNavigate();

  // ✅ aktif öğrenci
  let student = {};
  try {
    const raw = localStorage.getItem("activeStudent");
    student = raw ? JSON.parse(raw) : {};
  } catch {
    student = {};
  }

  const gridSize = 5; // 5x5

  const [running, setRunning] = useState(false);
  const [highlighted, setHighlighted] = useState([]); // number[]
  const [userAnswers, setUserAnswers] = useState([]); // number[]
  const [score, setScore] = useState({ correct: 0, wrong: 0, points: 0 });
  const [round, setRound] = useState(0);
  const [showing, setShowing] = useState(false);

  // süre (sn)
  const [time, setTime] = useState(0);
  const duration = 180; // 3 dk
  const [finishing, setFinishing] = useState(false); // çifte çağrı kilidi

  // ▶ Başlat
  const startExercise = () => {
    setScore({ correct: 0, wrong: 0, points: 0 });
    setRound(0);
    setTime(0);
    setRunning(true);
    startRound();
  };

  // 🔄 Yeni tur: 3 benzersiz kutu 1 sn parlasın
  const startRound = () => {
    const total = gridSize * gridSize;
    const set = new Set();
    while (set.size < 3) set.add(Math.floor(Math.random() * total));
    const boxes = Array.from(set);
    setHighlighted(boxes);
    setUserAnswers([]);
    setShowing(true);
    setTimeout(() => setShowing(false), 1000);
  };

  // ⏲ saniye sayacı
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // ⏳ süre bitince tamamla (erken bitirme yok)
  useEffect(() => {
    if (!running) return;
    if (time >= duration && !finishing) {
      (async () => {
        try {
          setFinishing(true);
          setRunning(false);
          alert("🧠 Hafıza Geliştirme Çalışması tamamlandı!");
          await completeExercise(student.kod, student.sinif, navigate);
        } catch (e) {
          console.error(e);
          alert("Bir hata oluştu, panel’e dönülüyor.");
          navigate("/panel", { replace: true });
        } finally {
          setFinishing(false);
        }
      })();
    }
  }, [time, duration, running, finishing, student.kod, student.sinif, navigate]);

  // 🖱️ Tıklama
  const handleClick = (index) => {
    if (!running || showing) return;
    if (userAnswers.includes(index)) return;

    const updated = [...userAnswers, index];
    setUserAnswers(updated);

    if (highlighted.includes(index)) {
      setScore((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        points: prev.points + 10,
      }));
    } else {
      setScore((prev) => ({
        ...prev,
        wrong: prev.wrong + 1,
        points: prev.points - 5,
      }));
    }

    // 3 seçimden sonra sıradaki tura (süre bitmediyse)
    if (updated.length >= 3 && time < duration) {
      setRound((r) => r + 1);
      startRound();
    }
  };

  const exitExercise = () => {
    if (running) {
      const ok = window.confirm(
        "⚠️ Egzersiz devam ediyor. Çıkarsan tamamlanmış sayılmaz. Emin misin?"
      );
      if (!ok) return;
    }
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="hafiza-container">
      <h2>🧠 Hafıza Geliştirme Çalışması</h2>

      <div className="buttons">
        <button className="start-btn" onClick={startExercise} disabled={running}>
          ▶ Başla
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          let boxClass = "box";
          if (showing && highlighted.includes(index)) boxClass += " highlight";
          else if (userAnswers.includes(index))
            boxClass += highlighted.includes(index) ? " correct" : " wrong";

          return (
            <div
              key={index}
              className={boxClass}
              onClick={() => handleClick(index)}
            />
          );
        })}
      </div>

      <div className="score-board">
        <h3>📊 Skor Tablosu</h3>
        <p>✅ Doğru: {score.correct}</p>
        <p>❌ Yanlış: {score.wrong}</p>
        <p>⭐ Puan: {score.points}</p>
        <p>🌀 Tur: {round}</p>
        <p>⏳ Kalan Süre: {Math.max(0, duration - time)} sn</p>
      </div>
    </div>
  );
}
