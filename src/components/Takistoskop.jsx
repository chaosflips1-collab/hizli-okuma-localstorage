// src/components/Takistoskop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Takistoskop() {
  const navigate = useNavigate();

  // Ayarlar
  const [material, setMaterial] = useState("harf");
  const [mode, setMode] = useState("manuel");
  const [speed, setSpeed] = useState(1000);
  const [level, setLevel] = useState(1);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(32);

  // Egzersiz state
  const [currentItem, setCurrentItem] = useState("");
  const [answer, setAnswer] = useState("");
  const [showItem, setShowItem] = useState(false);

  // Skor state
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  // Materyal listeleri
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
  const words = ["masa", "kitap", "araba", "çocuk", "okul", "kalem"];

  const getRandomItem = () => {
    if (material === "harf") {
      return letters[Math.floor(Math.random() * letters.length)];
    } else if (material === "rakam") {
      return numbers[Math.floor(Math.random() * numbers.length)];
    } else {
      return words[Math.floor(Math.random() * words.length)];
    }
  };

  const startExercise = () => {
    setRunning(true);
    setTime(0);
    const item = getRandomItem();
    setCurrentItem(item);
    setShowItem(true);

    setTimeout(() => {
      setShowItem(false);
    }, speed);
  };

  const checkAnswer = () => {
    if (!answer.trim()) {
      alert("Yanıt vermediniz!");
      return;
    }

    if (answer.trim().toLowerCase() === currentItem.toString().toLowerCase()) {
      setCorrect(correct + 1);
      setScore(score + 10);
      if (score + 10 > record) setRecord(score + 10);
      if ((correct + 1) % 3 === 0 && level < 10) {
        setLevel(level + 1);
      }
    } else {
      setWrong(wrong + 1);
    }
    setAnswer("");

    const newItem = getRandomItem();
    setCurrentItem(newItem);
    setShowItem(true);

    setTimeout(() => {
      setShowItem(false);
    }, speed);
  };

  // Zaman sayacı
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;

          if (newTime === 120) setSpeed(800);
          if (newTime === 240) setSpeed(600);

          if (newTime >= 300) {
            clearInterval(interval);
            setRunning(false);
            alert("Bugünkü Takistoskop egzersizi sona erdi!");
            navigate("/kosesel");
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
    setCurrentItem("");
    setAnswer("");
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel");
  };

  return (
    <div style={{ textAlign: "center", margin: "20px", fontFamily: "Comic Sans MS" }}>
      <h2 style={{ color: "#ff6600", textShadow: "2px 2px #ffd966" }}>🎯 Takistoskop Çalışması 🎯</h2>

      {/* Üst Alan */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        {/* Gösterim Alanı + Yanıt */}
        <div
          style={{
            width: "500px",
            border: "4px solid #4CAF50",
            borderRadius: "15px",
            backgroundColor: "#f9f9f9",
            boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              height: "150px",
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: font,
              fontSize: `${fontSize}px`,
              borderBottom: "2px dashed #4CAF50",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {showItem ? currentItem : ""}
          </div>
          <div style={{ padding: "15px" }}>
            <p style={{ fontWeight: "bold" }}>Yanıtınız?</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{
                padding: "10px",
                fontSize: "18px",
                borderRadius: "10px",
                border: "2px solid #4CAF50",
              }}
              disabled={!running}
            />
            <button
              onClick={checkAnswer}
              style={{
                marginLeft: "10px",
                padding: "10px 20px",
                borderRadius: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              disabled={!running}
            >
              ✅ Tamam
            </button>
          </div>
        </div>

        {/* Başarı Tablosu */}
        <div
          style={{
            width: "220px",
            border: "3px solid #ff9800",
            borderRadius: "15px",
            padding: "15px",
            textAlign: "left",
            backgroundColor: "#fff8e1",
            boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <h4 style={{ color: "#ff9800" }}>🏆 Başarı Tablosu</h4>
          <p>✔ Doğru: {correct}</p>
          <p>❌ Yanlış: {wrong}</p>
          <p>⭐ Skor: {score}</p>
          <p>🥇 Rekor: {record}</p>
          <p>⏳ Kalan Süre: {(300 - time).toFixed(0)} sn</p>
          <p>⚡ Hız: {speed} ms</p>
        </div>
      </div>

      {/* İstatistik Tablosu */}
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "#2196F3" }}>📊 İstatistik Tablosu</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
          {Array.from({ length: 10 }, (_, i) => {
            const lvl = i + 1;
            return (
              <div
                key={lvl}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  border: "2px solid #2196F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    level > lvl
                      ? "#4CAF50"
                      : level === lvl
                      ? "#ffeb3b"
                      : "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#333",
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
          border: "3px dashed #9c27b0",
          borderRadius: "15px",
          padding: "20px",
          width: "500px",
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#f3e5f5",
          boxShadow: "4px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <h4 style={{ color: "#9c27b0" }}>⚙️ Ayarlar Menüsü</h4>
        <div style={{ margin: "10px 0" }}>
          <label>Materyal: </label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)} disabled={running}>
            <option value="harf">Harf</option>
            <option value="kelime">Kelime</option>
            <option value="rakam">Rakam</option>
          </select>
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Çalışma Şekli: </label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={running}>
            <option value="otomatik">Otomatik</option>
            <option value="manuel">Manuel</option>
            <option value="rastgele">Rastgele</option>
          </select>
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Hız (ms): </label>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={running}
          />
          <span> {speed} ms</span>
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Zemin Renk: </label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={running} />
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
