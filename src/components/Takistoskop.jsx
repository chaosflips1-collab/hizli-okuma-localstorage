import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import "./Takistoskop.css"; // ✅ CSS dosyasını bağla

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

  const studentClass = localStorage.getItem("studentClass") || "6";

  const letters = library.letters || [];
  const numbers = library.numbers || [];
  const words = library.takistoskop?.[studentClass] || [];

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

    setTimeout(() => setShowItem(false), speed);
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
      if ((correct + 1) % 3 === 0 && level < 10) setLevel(level + 1);
    } else {
      setWrong(wrong + 1);
    }

    setAnswer("");
    const newItem = getRandomItem();
    setCurrentItem(newItem);
    setShowItem(true);

    setTimeout(() => setShowItem(false), speed);
  };

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
            navigate("/panel", { replace: true }); // ✅ garanti dönüş
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
    navigate("/panel", { replace: true }); // ✅ garanti dönüş
  };

  return (
    <div className="takistoskop-container">
      <h2 className="takistoskop-title">🎯 Takistoskop Çalışması 🎯</h2>

      {/* Üst Alan */}
      <div className="top-section">
        {/* Gösterim Alanı */}
        <div className="display-box">
          <div
            className="display-item"
            style={{
              backgroundColor: bgColor,
              fontFamily: font,
              fontSize: `${fontSize}px`,
            }}
          >
            {showItem ? currentItem : ""}
          </div>
          <div className="answer-section">
            <p>Yanıtınız?</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="answer-input"
              disabled={!running}
            />
            <button
              onClick={checkAnswer}
              className="answer-btn"
              disabled={!running}
            >
              ✅ Tamam
            </button>
          </div>
        </div>

        {/* Başarı Tablosu */}
        <div className="score-board">
          <h4>🏆 Başarı Tablosu</h4>
          <p>✔ Doğru: {correct}</p>
          <p>❌ Yanlış: {wrong}</p>
          <p>⭐ Skor: {score}</p>
          <p>🥇 Rekor: {record}</p>
          <p>⏳ Kalan Süre: {(300 - time).toFixed(0)} sn</p>
          <p>⚡ Hız: {speed} ms</p>
        </div>
      </div>

      {/* İstatistik Tablosu */}
      <div className="stats-section">
        <h3 className="stats-title">📊 İstatistik Tablosu</h3>
        <div className="levels">
          {Array.from({ length: 10 }, (_, i) => {
            const lvl = i + 1;
            return (
              <div
                key={lvl}
                className="level-circle"
                style={{
                  backgroundColor:
                    level > lvl ? "#4CAF50" : level === lvl ? "#ffeb3b" : "white",
                }}
              >
                {lvl}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ayarlar */}
      <div className="settings-box">
        <h4>⚙️ Ayarlar Menüsü</h4>
        <label>Materyal:</label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          disabled={running}
        >
          <option value="harf">Harf</option>
          <option value="kelime">Kelime</option>
          <option value="rakam">Rakam</option>
        </select>

        <label>Çalışma Şekli:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          disabled={running}
        >
          <option value="otomatik">Otomatik</option>
          <option value="manuel">Manuel</option>
          <option value="rastgele">Rastgele</option>
        </select>

        <label>Hız (ms):</label>
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={running}
        />
        <span>{speed} ms</span>

        <label>Zemin Renk:</label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          disabled={running}
        />

        <label>Font:</label>
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

        <label>Font Boyutu:</label>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          min="16"
          max="72"
          disabled={running}
        />
      </div>

      {/* Butonlar */}
      <div className="button-row">
        <button onClick={startExercise} className="start-btn" disabled={running}>
          ✔ Başla
        </button>
        <button onClick={exitExercise} className="exit-btn">
          ❌ Çıkış
        </button>
      </div>
    </div>
  );
}
