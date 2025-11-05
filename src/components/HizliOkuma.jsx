// src/components/HizliOkuma.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise";
import "./HizliOkuma.css";
import library from "../data/library.json";

export default function HizliOkuma() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [running, setRunning] = useState(false);
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);

  const [speed, setSpeed] = useState(300); // ms/kelime
  const [time, setTime] = useState(0);     // geçen saniye
  const duration = 240;                    // 4 dk

  const finishedRef = useRef(false);
  const wordTimerRef = useRef(null);
  const secTimerRef = useRef(null);

  // Kelime havuzu (sınıfa göre), yoksa yedek paragraf
  useEffect(() => {
    const level = String(student.sinif || "").replace(/\D/g, "") || "6";

    const poolA = library.hizliOkuma && library.hizliOkuma[level];
    const poolB = library.hizliokuma && library.hizliokuma[level];

    let list = [];
    if (Array.isArray(poolA) && poolA.length) {
      list = poolA.flatMap((w) => String(w).split(/\s+/)).filter(Boolean);
    } else if (Array.isArray(poolB) && poolB.length) {
      list = poolB.flatMap((w) => String(w).split(/\s+/)).filter(Boolean);
    }

    if (list.length === 0) {
      const fallback =
        "Başarı istikrarlı bir çabanın sonucudur. Her gün biraz daha ilerlemek mümkündür. Hızlı okuma sadece kelimeleri değil anlamı da yakalama sanatıdır.";
      list = fallback.split(/\s+/);
    }

    setWords(list);
    setIndex(0);
  }, [student.sinif]);

  useEffect(() => {
    const clearTimers = () => {
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
        wordTimerRef.current = null;
      }
      if (secTimerRef.current) {
        clearInterval(secTimerRef.current);
        secTimerRef.current = null;
      }
    };

    if (running && words.length > 0) {
      wordTimerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % words.length);
      }, Math.max(100, speed));

      secTimerRef.current = setInterval(() => {
        setTime((t) => {
          const nt = t + 1;
          if (nt >= duration && !finishedRef.current) {
            finishedRef.current = true;
            clearTimers();
            setRunning(false);
            alert("⚡ Hızlı Okuma Egzersizi tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate);
          }
          return nt;
        });
      }, 1000);
    } else {
      clearTimers();
    }

    return () => clearTimers();
  }, [running, speed, words.length, navigate, student.kod, student.sinif]);

  const handleExit = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="hizliokuma-container">
      <h2>⚡ Hızlı Okuma Egzersizi</h2>
      <p>Metin akarken gözünle yakala, anlamı kaçırma.</p>

      <div className="controls">
        <label>Hız (ms/kelime):</label>
        <input
          type="range"
          min="100"
          max="1000"
          step="50"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={running}
        />
        <span>{speed} ms</span>

        <button onClick={() => setRunning((s) => !s)} disabled={words.length === 0}>
          {running ? "⏸ Durdur" : "▶ Başlat"}
        </button>

        <button className="exit-btn" onClick={handleExit}>❌ Çıkış</button>
      </div>

      <div className="reading-box">
        <h3>{words[index] || "…"}</h3>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {Math.max(0, duration - time)} sn</p>
      </div>
    </div>
  );
}
