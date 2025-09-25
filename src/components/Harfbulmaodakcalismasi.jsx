// src/components/Harfbulmaodakcalismasi.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ çıkış için
import library from "../data/library.json";
import "./Harfbulmaodakcalismasi.css";

export default function Harfbulmaodakcalismasi() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [target, setTarget] = useState(null);
  const [visible, setVisible] = useState(false);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState({ correct: 0, wrong: 0, points: 0 });

  // ✅ Yeni round başlat
  const startGame = () => {
    const count = Math.floor(Math.random() * 4) + 5;
    const pool = [...(library.letters || []), ...(library.numbers || [])];
    const newItems = Array.from({ length: count }, () =>
      pool[Math.floor(Math.random() * pool.length)]
    );

    const randomTarget = newItems[Math.floor(Math.random() * newItems.length)];

    setItems(newItems);
    setTarget(randomTarget);
    setVisible(true);

    setTimeout(() => setVisible(false), 3000);

    setAnswer("");
  };

  // ✅ Kontrol et
  const checkAnswer = () => {
    const count = items.filter((n) => n === target).length;
    if (parseInt(answer) === count) {
      setScore((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        points: prev.points + 10,
      }));
      alert("✅ Doğru!");
    } else {
      setScore((prev) => ({
        ...prev,
        wrong: prev.wrong + 1,
        points: prev.points - 5,
      }));
      alert(`❌ Yanlış! Doğru cevap: ${count}`);
    }
  };

  const exitExercise = () => {
    navigate("/panel");
  };

  return (
    <div className="harf-odak-container">
      <h2>🔍 Harf Bulma Odak Çalışması</h2>

      {/* Harfler/Rakamlar */}
      <div className="display-area">
        {visible
          ? items.map((item, i) => (
              <span key={i} className="display-item">
                {item}
              </span>
            ))
          : target && (
              <p className="question">
                👀 Kaç tane <b>{target}</b> vardı?
              </p>
            )}
      </div>

      {/* Yanıt kutusu */}
      {!visible && target !== null && (
        <div className="answer-box">
          <input
            type="number"
            placeholder="Adet sayısını gir"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button onClick={checkAnswer}>✅ Kontrol Et</button>
        </div>
      )}

      {/* Başlat ve Çıkış butonları */}
      <div className="buttons">
        <button className="start-btn" onClick={startGame}>
          ▶️ Başlat
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      {/* Skor Tablosu */}
      <div className="score-board">
        <h3>📊 Skor Tablosu</h3>
        <p>✅ Doğru: {score.correct}</p>
        <p>❌ Yanlış: {score.wrong}</p>
        <p>⭐ Puan: {score.points}</p>
      </div>
    </div>
  );
}
