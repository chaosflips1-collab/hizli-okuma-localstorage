import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise"; // ✅ Firestore ilerleme fonksiyonu
import "./HizliOkuma.css";
import library from "../data/library.json";

export default function HizliOkuma() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [running, setRunning] = useState(false);
  const [text, setText] = useState([]);
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState(300);
  const [time, setTime] = useState(0);
  const [duration] = useState(240); // 4 dakika

  useEffect(() => {
    // Örnek metin havuzu (kütüphaneden de alınabilir)
    const sampleText =
      library.hizliokuma ||
      "Başarı, istikrarlı bir çabanın sonucudur. Her gün biraz daha ilerlemek mümkündür. Hızlı okuma, yalnızca kelimeleri değil, anlamı da yakalayabilme sanatıdır.";
    const words = sampleText.split(" ");
    setText(words);
  }, []);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % text.length);
        setTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            clearInterval(interval);
            setRunning(false);
            alert("⚡ Hızlı Okuma Egzersizi tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate); // ✅ ilerleme kaydı
          }
          return newTime;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [running, speed, duration, text, navigate, student.kod, student.sinif]);

  const handleExit = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="hizliokuma-container">
      <h2>⚡ Hızlı Okuma Egzersizi</h2>
      <p>Metin ekranda hızlıca akarken anlamı yakalamaya çalış.</p>

      <div className="controls">
        <label>Hız (ms):</label>
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
        <button onClick={() => setRunning(!running)}>
          {running ? "⏸ Durdur" : "▶ Başlat"}
        </button>
        <button className="exit-btn" onClick={handleExit}>
          ❌ Çıkış
        </button>
      </div>

      <div className="reading-box">
        <h3>{text[index]}</h3>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {duration - time} sn</p>
      </div>
    </div>
  );
}
