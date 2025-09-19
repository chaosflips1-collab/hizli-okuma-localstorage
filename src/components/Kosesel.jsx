// src/components/Kosesel.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Kosesel() {
  const navigate = useNavigate();

  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(48);

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [letters, setLetters] = useState(["", ""]);

  const [speed, setSpeed] = useState(1000);

  const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
            alert("Köşesel Egzersiz tamamlandı!");
            navigate("/acili");
            return prev;
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, navigate]);

  const exitExercise = () => {
    setRunning(false);
    setLetters(["", ""]);
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel");
  };

  return (
    <div style={{ textAlign: "center", margin: "20px", fontFamily: "Comic Sans MS" }}>
      <h2 style={{ color: "#3f51b5", textShadow: "2px 2px #bbdefb" }}>🔲 Köşesel Çalışma 🔲</h2>

      {/* Gösterim Alanı */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px" }}>
        {letters.map((ltr, i) => (
          <div
            key={i}
            style={{
              width: "200px",
              height: "150px",
              border: "4px solid #3f51b5",
              borderRadius: "15px",
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: font,
              fontSize: `${fontSize}px`,
              fontWeight: "bold",
              color: "#333",
              boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {ltr}
          </div>
        ))}
      </div>

      {/* Bilgi Tablosu */}
      <div
        style={{
          width: "260px",
          border: "3px solid #ff9800",
          borderRadius: "15px",
          padding: "15px",
          margin: "20px auto",
          backgroundColor: "#fff8e1",
          textAlign: "left",
          boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <h4 style={{ color: "#ff9800" }}>📋 Bilgi Tablosu</h4>
        <p>⏳ Kalan Süre: {180 - time} sn</p>
        <p>⚡ Hız: {speed} ms</p>
      </div>

      {/* Ayarlar */}
      <div
        style={{
          marginTop: "20px",
          border: "3px dashed #009688",
          borderRadius: "15px",
          padding: "20px",
          width: "500px",
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#e0f2f1",
          boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <h4 style={{ color: "#009688" }}>⚙️ Ayarlar Menüsü</h4>
        <div style={{ margin: "10px 0" }}>
          <label>Zemin Renk: </label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            disabled={running}
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Font: </label>
          <select value={font} onChange={(e) => setFont(e.target.value)} disabled={running}>
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </div>
        <div style={{ margin: "10px 0" }}>
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

      {/* Butonlar */}
      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "15px 40px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "12px",
            marginRight: "10px",
            cursor: "pointer",
            boxShadow: "3px 3px 8px rgba(0,0,0,0.2)",
          }}
          onClick={startExercise}
          disabled={running}
        >
          ✔ Başla
        </button>
        <button
          style={{
            padding: "15px 40px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "3px 3px 8px rgba(0,0,0,0.2)",
          }}
          onClick={exitExercise}
        >
          ❌ Çıkış
        </button>
      </div>
    </div>
  );
}
