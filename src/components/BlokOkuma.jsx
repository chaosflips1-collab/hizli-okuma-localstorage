import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise"; // ✅ eklendi
import "./BlokOkuma.css";
import library from "../data/library.json";

export default function BlokOkuma() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [running, setRunning] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(2000);
  const [duration] = useState(180); // 3 dakika

  // Blok metinleri yükle
  useEffect(() => {
    const texts = library.blokokuma || [
      "Zaman, doğru kullanıldığında bir hazinedir.",
      "Her gün biraz daha fazla öğrenmek mümkündür.",
      "Okumak, insanın ufkunu genişletir.",
      "Sabır, başarının en önemli anahtarıdır.",
    ];
    setBlocks(texts);
  }, []);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % blocks.length);
        setTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            clearInterval(interval);
            setRunning(false);
            alert("📚 Blok Okuma Egzersizi tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate); // ✅ ilerleme kaydı
          }
          return newTime;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [running, speed, duration, blocks, navigate, student.kod, student.sinif]);

  const handleExit = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="blok-container">
      <h2>📚 Blok Okuma Egzersizi</h2>
      <p>Kelimeleri bloklar halinde hızlıca okumaya çalış.</p>

      <div className="controls">
        <label>Hız (ms):</label>
        <input
          type="range"
          min="500"
          max="4000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={running}
        />
        <span>{speed} ms</span>
        <button onClick={() => setRunning(!running)}>
          {running ? "⏸ Durdur" : "▶ Başlat"}
        </button>
        <button className="exit-btn" onClick={handleExit}>
          ❌ Çıkış
        </button>
      </div>

      <div className="blok-box">
        <h3>{blocks[index]}</h3>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {duration - time} sn</p>
      </div>
    </div>
  );
}
