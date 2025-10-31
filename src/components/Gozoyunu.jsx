import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise"; // ✅ eklendi
import "./Gozoyunu.css";

export default function Gozoyunu() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [position, setPosition] = useState("top-left");
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [emoji, setEmoji] = useState("😵");
  const [time, setTime] = useState(0);
  const [duration] = useState(180); // 3 dakika

  const positions = ["top-left", "top-right", "bottom-right", "bottom-left"];
  const emojis = ["😵", "🤓", "😎", "🐱", "🐸", "🐧", "🦊", "🐶"];

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setPosition((prev) => {
          const currentIndex = positions.indexOf(prev);
          const nextIndex = (currentIndex + 1) % positions.length;
          return positions[nextIndex];
        });
        setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
        setTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            clearInterval(interval);
            setRunning(false);
            alert("👁️ Göz Oyunu tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate); // ✅ ilerleme kaydı
          }
          return newTime;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [running, speed, duration, navigate, student.kod, student.sinif]);

  const exitExercise = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="goz-container">
      <h2>👀 Göz Kaslarını Geliştirme Çalışması</h2>
      <p>Ortadaki noktaya odaklan, emojiyi gözlerinle takip et.</p>

      {/* Butonlar */}
      <div className="buttons">
        <button className="start" onClick={() => setRunning(true)} disabled={running}>
          ▶ Başlat
        </button>
        <button className="stop" onClick={() => setRunning(false)} disabled={!running}>
          ⏸ Durdur
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      {/* Hız Ayarı */}
      <div className="speed-control">
        <label>⏱️ Hız: </label>
        <input
          type="range"
          min="300"
          max="3000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={running}
        />
        <span> {speed} ms</span>
      </div>

      {/* Oyun Alanı */}
      <div className="playground">
        <span className={`emoji ${position}`}>{emoji}</span>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {duration - time} sn</p>
      </div>
    </div>
  );
}
