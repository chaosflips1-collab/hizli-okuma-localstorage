// src/components/Acili.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Acili() {
  const navigate = useNavigate();

  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(32);

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [phase, setPhase] = useState("down");
  const [letters, setLetters] = useState([]);

  const [speed, setSpeed] = useState(1000);

  const pool = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

  const generateLetters = () => {
    let arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return arr;
  };

  const startExercise = () => {
    setRunning(true);
    setTime(0);
    setPhase("down");
    setLetters(generateLetters());
  };

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;

          if (newTime <= 60) setSpeed(1000);
          else if (newTime <= 120) setSpeed(700);
          else setSpeed(500);

          if (newTime % 3 === 0) {
            setPhase((prevPhase) =>
              prevPhase === "down"
                ? "inward"
                : prevPhase === "inward"
                ? "outward"
                : "down"
            );
            setLetters(generateLetters());
          }

          if (newTime >= 180) {
            clearInterval(timer);
            setRunning(false);
            alert("Açılı Okuma Egzersizi tamamlandı!");
            navigate("/panel");
            return prev;
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running, navigate]);

  const exitExercise = () => {
    setRunning(false);
    setLetters([]);
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel");
  };

  const getLetterStyle = (index) => {
    const baseX = (index % 10) * 40 + 20;
    const baseY = Math.floor(index / 10) * 40 + 40;

    if (phase === "down") {
      return { top: `${baseY + 20}px`, left: `${baseX}px` };
    } else if (phase === "inward") {
      return { top: `${baseY}px`, left: `${200 + index * 20}px` };
    } else if (phase === "outward") {
      return { top: `${baseY}px`, left: `${index * 60}px` };
    }
    return {};
  };

  return (
    <div style={{ textAlign: "center", margin: "20px", fontFamily: "Comic Sans MS" }}>
      <h2 style={{ color: "#e91e63", textShadow: "2px 2px #f8bbd0" }}>
        📐 Açılı Okuma Egzersizi
      </h2>

      {/* Harf Alanı */}
      <div
        style={{
          width: "650px",
          height: "300px",
          margin: "0 auto",
          border: "4px solid #e91e63",
          borderRadius: "15px",
          backgroundColor: bgColor,
          position: "relative",
          overflow: "hidden",
          boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        {letters.map((ltr, idx) => (
          <span
            key={idx}
            style={{
              position: "absolute",
              fontFamily: font,
              fontSize: `${fontSize}px`,
              fontWeight: "bold",
              color: "#333",
              ...getLetterStyle(idx),
            }}
          >
            {ltr}
          </span>
        ))}
      </div>

      {/* Başarı Tablosu */}
      <div
        style={{
          width: "260px",
          border: "3px solid #ff5722",
          borderRadius: "15px",
          padding: "15px",
          margin: "20px auto",
          backgroundColor: "#fff3e0",
          textAlign: "left",
          boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <h4 style={{ color: "#ff5722" }}>📊 Başarı Tablosu</h4>
        <p>⏳ Kalan Süre: {180 - time} sn</p>
        <p>⚡ Hız: {speed} ms</p>
      </div>

      {/* İstatistik Tablosu */}
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "#9c27b0" }}>📈 İstatistik Tablosu</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
          {Array.from({ length: 10 }, (_, i) => {
            const lvl = i + 1;
            return (
              <div
                key={lvl}
                style={{
                  width: "35px",
                  height: "35px",
                  border: "2px solid #9c27b0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  backgroundColor:
                    time / 18 >= lvl
                      ? "#4caf50"
                      : time / 18 + 1 === lvl
                      ? "#ffeb3b"
                      : "white",
                  fontWeight: "bold",
                }}
              >
                {lvl}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ayarlar */}
      <div
        style={{
          marginTop: "20px",
          border: "3px dashed #3f51b5",
          borderRadius: "15px",
          padding: "20px",
          width: "500px",
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#e8eaf6",
          boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <h4 style={{ color: "#3f51b5" }}>⚙️ Ayarlar Menüsü</h4>
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
