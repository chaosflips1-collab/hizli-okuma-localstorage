// src/components/Kosesel.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import completeExercise from "../utils/completeExercise";
import "./Kosesel.css";

export default function Kosesel() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(48);

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [letters, setLetters] = useState(["", ""]);

  const speed = 1000; // bilgi amaçlı gösteriyoruz
  const pool = library.letters || [];
  const timerRef = useRef(null);

  const generateLetters = () => [
    pool[Math.floor(Math.random() * pool.length)] || "",
    pool[Math.floor(Math.random() * pool.length)] || "",
  ];

  const startExercise = () => {
    if (!pool.length) {
      alert("⚠️ Harf havuzu bulunamadı.");
      return;
    }
    setRunning(true);
    setTime(0);
    setLetters(generateLetters());
  };

  // süre/akış
  useEffect(() => {
    const clear = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (running) {
      clear(); // olası eski timer’ı temizle
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          const t = prev + 1;

          // 3 sn’de bir harfleri değiştir
          if (t % 3 === 0) setLetters(generateLetters());

          // 180 sn dolunca bitir
          if (t >= 180) {
            clear();
            setRunning(false);
            // tek yerden ilerleme: plan sıradaki egzersize geçer / mini oyun tetiklenir
            alert("🎯 Köşesel Egzersiz tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate);
          }
          return t;
        });
      }, 1000);
    } else {
      clear();
    }

    return () => clear();
  }, [running, navigate, student.kod, student.sinif]);

  const exitExercise = () => {
    setRunning(false);
    setLetters(["", ""]);
    navigate("/panel");
  };

  return (
    <div className="kosesel-container">
      <h2 className="kosesel-title">🔲 Köşesel Çalışma 🔲</h2>

      <div className="letters-box">
        {letters.map((ltr, i) => (
          <div
            key={i}
            className="letter-card"
            style={{
              backgroundColor: bgColor,
              fontFamily: font,
              fontSize: `${fontSize}px`,
            }}
          >
            {ltr}
          </div>
        ))}
      </div>

      <div className="info-box">
        <h4>📋 Bilgi Tablosu</h4>
        <p>⏳ Kalan Süre: {Math.max(0, 180 - time)} sn</p>
        <p>⚡ Hız: {speed} ms</p>
      </div>

      <div className="settings-box">
        <h4>⚙️ Ayarlar Menüsü</h4>
        <div>
          <label>Zemin Renk: </label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            disabled={running}
          />
        </div>
        <div>
          <label>Font: </label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            disabled={running}
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </div>
        <div>
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

      <div className="buttons">
        <button className="start-btn" onClick={startExercise} disabled={running}>
          ✔ Başla
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>
    </div>
  );
}
