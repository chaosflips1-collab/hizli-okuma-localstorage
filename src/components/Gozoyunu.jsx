// src/components/Gozoyunu.jsx
import React, { useEffect, useState } from "react";

export default function Gozoyunu() {
  const [position, setPosition] = useState("top-left");
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms
  const [emoji, setEmoji] = useState("😵");

  // 4 köşe konumları
  const positions = ["top-left", "top-right", "bottom-right", "bottom-left"];
  const emojis = ["😵", "🤓", "😎", "🐱", "🐸", "🐧", "🦊", "🐶"];

  // Emoji hareketi
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setPosition((prev) => {
        const currentIndex = positions.indexOf(prev);
        const nextIndex = (currentIndex + 1) % positions.length;
        return positions[nextIndex];
      });
      // Emoji her hareket değişir
      setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, speed);

    return () => clearInterval(interval);
  }, [running, speed]);

  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <h2>👀 Göz Kaslarını Geliştirme Çalışması</h2>
      <p>Ortadaki noktaya odaklan, emojiyi gözlerinle takip et.</p>

      {/* Başlat & Durdur Butonları */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setRunning(true)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            marginRight: "10px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ▶ Başlat
        </button>
        <button
          onClick={() => setRunning(false)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ⏸ Durdur
        </button>
      </div>

      {/* Hız Ayarı */}
      <div style={{ marginBottom: "20px" }}>
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
      <div
        style={{
          position: "relative",
          width: "600px",
          height: "400px",
          margin: "30px auto",
          border: "2px solid #ccc",
          borderRadius: "12px",
          background: "#f9f9f9",
        }}
      >
        <span
          style={{
            position: "absolute",
            fontSize: "60px",
            transition: "all 0.6s ease",
            ...(position === "top-left" && { top: "10px", left: "10px" }),
            ...(position === "top-right" && { top: "10px", right: "10px" }),
            ...(position === "bottom-right" && { bottom: "10px", right: "10px" }),
            ...(position === "bottom-left" && { bottom: "10px", left: "10px" }),
          }}
        >
          {emoji}
        </span>
      </div>
    </div>
  );
}
