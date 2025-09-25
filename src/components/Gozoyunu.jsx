// src/components/Gozoyunu.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ çıkış için
import "./Gozoyunu.css"; // ✅ CSS eklendi

export default function Gozoyunu() {
  const navigate = useNavigate();

  const [position, setPosition] = useState("top-left");
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms
  const [emoji, setEmoji] = useState("😵");

  const positions = ["top-left", "top-right", "bottom-right", "bottom-left"];
  const emojis = ["😵", "🤓", "😎", "🐱", "🐸", "🐧", "🦊", "🐶"];

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setPosition((prev) => {
        const currentIndex = positions.indexOf(prev);
        const nextIndex = (currentIndex + 1) % positions.length;
        return positions[nextIndex];
      });
      setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, speed);

    return () => clearInterval(interval);
  }, [running, speed]);

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
        <button className="start" onClick={() => setRunning(true)}>
          ▶ Başlat
        </button>
        <button className="stop" onClick={() => setRunning(false)}>
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
        />
        <span> {speed} ms</span>
      </div>

      {/* Oyun Alanı */}
      <div className="playground">
        <span className={`emoji ${position}`}>{emoji}</span>
      </div>
    </div>
  );
}
