// src/components/Takistoskop.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import library from "../data/library.json";
import completeExercise from "../utils/completeExercise";
import "./TakistoskopFixed.css";

export default function Takistoskop() {
  const navigate = useNavigate();
  const location = useLocation();

  // Egzersiz Player'dan gelirse süre override edilebilir
  const { duration: fromPlayerDuration } = location.state || {};
  const duration = fromPlayerDuration || 300; // varsayılan 5 dk

  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  // ---- Ayarlar
  const [material, setMaterial] = useState("harf"); // harf | rakam | kelime
  const [speed, setSpeed] = useState(1000);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(32);
  const [showSettings, setShowSettings] = useState(false);

  // ---- Oyun durumu
  const [currentItem, setCurrentItem] = useState("");
  const [showItem, setShowItem] = useState(false);
  const [answer, setAnswer] = useState("");

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const tRef = useRef(null);

  // ---- Havuzlar
  const classKey = (() => {
    const s = (student?.sinif || "").toString().trim().toUpperCase(); // örn. "6A"
    const digit = s.match(/\d+/)?.[0] || "6";
    return digit; // "5", "6" veya "7"
  })();

  const letters = library.letters || [];
  const numbers = library.numbers || [];

  const wordPool =
    (library.takistoskop && library.takistoskop[classKey]) ||
    // havuz boşsa İngilizce 7. seviye kelimeleri fallback
    library.takistoskop?.["7"] ||
    [];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const nextItem = () => {
    if (material === "harf") return pick(letters);
    if (material === "rakam") return pick(numbers);
    return pick(wordPool);
  };

  const start = () => {
    // materyal için havuz uygun mu?
    if (material === "harf" && letters.length === 0) return alert("Harf havuzu boş.");
    if (material === "rakam" && numbers.length === 0) return alert("Rakam havuzu boş.");
    if (material === "kelime" && wordPool.length === 0) return alert("Bu sınıf için kelime havuzu boş.");

    setCorrect(0);
    setWrong(0);
    setScore(0);
    setTime(0);
    setAnswer("");
    setRunning(true);

    const item = nextItem();
    setCurrentItem(item);
    setShowItem(true);
    setTimeout(() => setShowItem(false), speed);
  };

  const stop = () => setRunning(false);

  const revealNew = () => {
    const item = nextItem();
    setCurrentItem(item);
    setShowItem(true);
    setTimeout(() => setShowItem(false), speed);
  };

  const submitAnswer = () => {
    if (!running) return;
    if (!answer.trim()) {
      alert("Yanıt vermediniz!");
      return;
    }

    const ok =
      answer.trim().toLowerCase() === currentItem.toString().toLowerCase();

    if (ok) {
      setCorrect((c) => c + 1);
      setScore((s) => {
        const ns = s + 10;
        if (ns > record) setRecord(ns);
        return ns;
      });
    } else {
      setWrong((w) => w + 1);
    }

    setAnswer("");
    revealNew();
  };

  // Zamanlayıcı
  useEffect(() => {
    const clear = () => {
      if (tRef.current) {
        clearInterval(tRef.current);
        tRef.current = null;
      }
    };

    if (running) {
      clear();
      tRef.current = setInterval(() => {
        setTime((prev) => {
          const t = prev + 1;

          // hız kademeleri
          if (t === 120) setSpeed((s) => Math.max(300, s - 200)); // 1. dk: 1000->800
          if (t === 240) setSpeed((s) => Math.max(300, s - 200)); // 2. dk: 800->600

          if (t >= duration) {
            clear();
            setRunning(false);
            alert("🎯 Takistoskop egzersizi tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate);
          }
          return t;
        });
      }, 1000);
    } else {
      clear();
    }

    return () => clear();
  }, [running, duration, navigate, student.kod, student.sinif]);

  const exitExercise = () => {
    setRunning(false);
    navigate("/panel", { replace: true });
  };

  return (
    <div className="takistoskop-container">
      <h2 className="takistoskop-title">🎯 Takistoskop Çalışması</h2>

      <div className="top-section">
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
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
            />
            <button className="answer-btn" onClick={submitAnswer} disabled={!running}>
              ✅ Tamam
            </button>
          </div>
        </div>

        <div className="score-board">
          <h4>🏆 Başarı Tablosu</h4>
          <p>✔ Doğru: {correct}</p>
          <p>❌ Yanlış: {wrong}</p>
          <p>⭐ Skor: {score}</p>
          <p>🥇 Rekor: {record}</p>
          <p>⏳ Kalan Süre: {Math.max(0, duration - time)} sn</p>
          <p>⚡ Hız: {speed} ms</p>
        </div>
      </div>

      {/* ⚙️ Ayarlar */}
      <div className="settings-wrapper">
        <div className="settings-header" onClick={() => setShowSettings((v) => !v)}>
          ⚙️ Ayarlar Menüsü {showSettings ? "▲" : "▼"}
        </div>

        {showSettings && (
          <div className="settings-box slide-down">
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
            <select value={font} onChange={(e) => setFont(e.target.value)} disabled={running}>
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
        )}
      </div>

      <div className="button-row">
        <button className="start-btn" onClick={start} disabled={running}>
          ✔ Başla
        </button>
        <button className="stop-btn" onClick={stop} disabled={!running}>
          ⏸ Durdur
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>
    </div>
  );
}
