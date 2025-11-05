// src/components/Harfbulmaodakcalismasi.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import completeExercise from "../utils/completeExercise";
import "./Harfbulmaodakcalismasi.css";

export default function Harfbulmaodakcalismasi() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [items, setItems] = useState([]);
  const [target, setTarget] = useState(null);
  const [visible, setVisible] = useState(false);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState({ correct: 0, wrong: 0, points: 0 });
  const [round, setRound] = useState(0);
  const [running, setRunning] = useState(false);
  const finishingRef = useRef(false); // çifte tamamlamayı engelle

  const pool = [...(library.letters || []), ...(library.numbers || [])];

  const startGame = () => {
    // 10 tur tamamlandıysa bitir (erken bitirme yok)
    if (round >= 10) {
      if (!finishingRef.current) {
        finishingRef.current = true;
        alert("🎯 Harf Bulma Odak Çalışması tamamlandı!");
        completeExercise(student.kod, student.sinif, navigate);
      }
      return;
    }

    if (pool.length === 0) {
      alert("⚠️ Harf/Rakam havuzu boş görünüyor.");
      return;
    }

    setRunning(true);

    // 5–8 arası öğe
    const count = Math.floor(Math.random() * 4) + 5;
    const newItems = Array.from({ length: count }, () =>
      pool[Math.floor(Math.random() * pool.length)]
    );
    const randomTarget = newItems[Math.floor(Math.random() * newItems.length)];

    setItems(newItems);
    setTarget(randomTarget);
    setVisible(true);
    setAnswer("");

    // 3 sn göster, sonra gizle
    setTimeout(() => setVisible(false), 3000);
  };

  const checkAnswer = () => {
    if (!running) return;
    if (visible) {
      // daha görünürken kontrol edilmesini engelle
      return;
    }
    if (target == null || !Array.isArray(items) || items.length === 0) return;

    const userVal = parseInt(answer, 10);
    if (Number.isNaN(userVal)) {
      alert("Lütfen bir sayı gir.");
      return;
    }

    const count = items.filter((n) => n === target).length;
    setScore((prev) => {
      if (userVal === count) {
        return { ...prev, correct: prev.correct + 1, points: prev.points + 10 };
      }
      return { ...prev, wrong: prev.wrong + 1, points: prev.points - 5 };
    });

    // sonraki tura geç
    setRound((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        if (!finishingRef.current) {
          finishingRef.current = true;
          alert("🎯 Harf Bulma Odak Çalışması tamamlandı!");
          completeExercise(student.kod, student.sinif, navigate);
        }
      } else {
        startGame();
      }
      return next;
    });
  };

  const exitExercise = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="harf-odak-container">
      <h2>🔍 Harf Bulma Odak Çalışması</h2>

      <div className="display-area">
        {visible ? (
          items.map((item, i) => (
            <span key={i} className="display-item">
              {item}
            </span>
          ))
        ) : target !== null ? (
          <p className="question">
            👀 Kaç tane <b>{target}</b> vardı?
          </p>
        ) : (
          <p className="question">Başlamak için “Başlat”a bas.</p>
        )}
      </div>

      {!visible && target !== null && (
        <div className="answer-box">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Adet sayısını gir"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button onClick={checkAnswer}>✅ Kontrol Et</button>
        </div>
      )}

      <div className="buttons">
        <button className="start-btn" onClick={startGame} disabled={visible}>
          ▶️ Başlat
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      <div className="score-board">
        <h3>📊 Skor Tablosu</h3>
        <p>✅ Doğru: {score.correct}</p>
        <p>❌ Yanlış: {score.wrong}</p>
        <p>⭐ Puan: {score.points}</p>
        <p>🌀 Tur: {round}/10</p>
      </div>
    </div>
  );
}
