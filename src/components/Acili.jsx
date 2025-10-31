import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import completeExercise from "../utils/completeExercise"; // ✅ yeni
import "./Acili.css";

export default function Acili() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(32);

  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [phase, setPhase] = useState("down");
  const [letters, setLetters] = useState([]);
  const [speed, setSpeed] = useState(1000);

  const pool = library.letters || [];

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
            alert("📐 Açılı Okuma Egzersizi tamamlandı!");

            // ✅ Firestore ilerleme güncellemesi
            completeExercise(student.kod, student.sinif, navigate);

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
    <div className="acili-container">
      <h2 className="acili-title">📐 Açılı Okuma Egzersizi</h2>

      <div className="letter-area" style={{ backgroundColor: bgColor }}>
        {letters.map((ltr, idx) => (
          <span
            key={idx}
            className="letter"
            style={{
              fontFamily: font,
              fontSize: `${fontSize}px`,
              ...getLetterStyle(idx),
            }}
          >
            {ltr}
          </span>
        ))}
      </div>

      <div className="success-box">
        <h4>📊 Başarı Tablosu</h4>
        <p>⏳ Kalan Süre: {180 - time} sn</p>
        <p>⚡ Hız: {speed} ms</p>
      </div>

      <div className="stats">
        <h3>📈 İstatistik Tablosu</h3>
        <div className="levels">
          {Array.from({ length: 10 }, (_, i) => {
            const lvl = i + 1;
            return (
              <div
                key={lvl}
                className={`level ${
                  time / 18 >= lvl
                    ? "done"
                    : time / 18 + 1 === lvl
                    ? "current"
                    : ""
                }`}
              >
                {lvl}
              </div>
            );
          })}
        </div>
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
