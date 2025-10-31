import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import completeExercise from "../utils/completeExercise"; // ✅ eklendi
import "./Cifttarafliodak.css";

export default function Cifttarafliodak() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [running, setRunning] = useState(false);
  const [words, setWords] = useState(["", ""]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(3);

  const studentClass = student.sinif || "6";
  const pool = (library.ciftTarafliOdak && library.ciftTarafliOdak[studentClass]) || [];

  const generateWords = () => {
    if (pool.length === 0) return;
    const w1 = pool[Math.floor(Math.random() * pool.length)];
    const same = Math.random() < 0.4;
    const w2 = same ? w1 : pool[Math.floor(Math.random() * pool.length)];
    setWords([w1, w2]);
  };

  const startExercise = () => {
    setRunning(true);
    setScore(0);
    setRound(0);
    setMessage("");
    setTimer(3);
    generateWords();
  };

  useEffect(() => {
    if (!running) return;
    if (round >= 20) {
      setRunning(false);
      setMessage(`🏆 Oyun bitti! Toplam Puan: ${score}`);

      // ✅ Egzersiz bittiğinde progress güncelle
      completeExercise(student.kod, student.sinif, navigate);
      return;
    }

    const countdown = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setRound((r) => r + 1);
          generateWords();
          return 3;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [running, round, score]);

  const handleAnswer = () => {
    if (words[0] === words[1]) {
      setScore((s) => s + 1);
      setMessage("✅ Doğru! +1 puan");
    } else {
      setMessage("❌ Yanlış!");
    }
    setRound((r) => r + 1);
    generateWords();
    setTimer(3);
  };

  const exitExercise = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="cift-container">
      <h2>🔁 Çift Taraflı Odak Egzersizi</h2>

      {!running ? (
        <div className="menu">
          <button
            className="start-btn"
            onClick={startExercise}
            disabled={pool.length === 0}
          >
            ▶ Başlat
          </button>
          <button className="exit-btn" onClick={exitExercise}>
            ❌ Çıkış
          </button>
          {pool.length === 0 && (
            <p className="warning">⚠ Bu sınıf için henüz kelime eklenmedi.</p>
          )}
        </div>
      ) : (
        <div className="game">
          <div className="word-boxes">
            <div className="word-box">{words[0]}</div>
            <div className="word-box">{words[1]}</div>
          </div>

          <div className="stats">
            <p>⏳ Kalan Süre: {timer} sn</p>
            <p>🏅 Puan: {score}</p>
            <p>🔄 Tur: {round}/20</p>
          </div>

          <button className="answer-btn" onClick={handleAnswer}>
            ✅ Aynıysa Tıkla
          </button>

          {message && <p className="message">{message}</p>}

          <button className="exit-btn" onClick={exitExercise} style={{ marginTop: "15px" }}>
            ❌ Çıkış
          </button>
        </div>
      )}
    </div>
  );
}
