import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import completeExercise from "../utils/completeExercise"; // ✅ eklendi
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

  const pool = [...(library.letters || []), ...(library.numbers || [])];

  const startGame = () => {
    if (round >= 10) {
      alert("🎯 Harf Bulma Egzersizi tamamlandı!");
      completeExercise(student.kod, student.sinif, navigate); // ✅ ilerleme kaydı
      return;
    }

    const count = Math.floor(Math.random() * 4) + 5;
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

  const checkAnswer = () => {
    const count = items.filter((n) => n === target).length;
    let updatedScore = { ...score };

    if (parseInt(answer) === count) {
      updatedScore.correct += 1;
      updatedScore.points += 10;
      alert("✅ Doğru!");
    } else {
      updatedScore.wrong += 1;
      updatedScore.points -= 5;
      alert(`❌ Yanlış! Doğru cevap: ${count}`);
    }

    setScore(updatedScore);
    setRound((prev) => prev + 1);

    // ✅ Son tur kontrolü
    if (round + 1 >= 10) {
      alert("🎯 Harf Bulma Odak Çalışması tamamlandı!");
      completeExercise(student.kod, student.sinif, navigate);
    } else {
      startGame();
    }
  };

  const exitExercise = () => {
    navigate("/panel");
  };

  return (
    <div className="harf-odak-container">
      <h2>🔍 Harf Bulma Odak Çalışması</h2>

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

      <div className="buttons">
        <button className="start-btn" onClick={startGame}>
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
