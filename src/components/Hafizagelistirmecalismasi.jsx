// src/components/Hafizagelistirmecalismasi.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ çıkış için
import "./Hafizagelistirmecalismasi.css";

export default function Hafizagelistirmecalismasi() {
  const navigate = useNavigate();
  const gridSize = 5; // 5x5 kare
  const [highlighted, setHighlighted] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState({ correct: 0, wrong: 0, points: 0 });
  const [showing, setShowing] = useState(false);

  // Rastgele kutular seç
  const startGame = () => {
    const randomBoxes = [];
    while (randomBoxes.length < 3) {
      const random = Math.floor(Math.random() * gridSize * gridSize);
      if (!randomBoxes.includes(random)) {
        randomBoxes.push(random);
      }
    }
    setHighlighted(randomBoxes);
    setUserAnswers([]);
    setShowing(true);

    setTimeout(() => {
      setShowing(false);
    }, 1000);
  };

  // Kareye tıklandığında
  const handleClick = (index) => {
    if (userAnswers.includes(index)) return;

    if (highlighted.includes(index)) {
      setScore((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        points: prev.points + 10,
      }));
    } else {
      setScore((prev) => ({
        ...prev,
        wrong: prev.wrong + 1,
        points: prev.points - 5,
      }));
    }

    setUserAnswers([...userAnswers, index]);
  };

  const exitExercise = () => {
    navigate("/panel");
  };

  return (
    <div className="hafiza-container">
      <h2>🧠 Hafıza Geliştirme Çalışması</h2>
      <div className="buttons">
        <button className="start-btn" onClick={startGame}>
          ▶ Başla
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      {/* Kareler */}
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          let boxClass = "box";

          if (showing && highlighted.includes(index)) {
            boxClass += " highlight"; // gösterim sırasında sarı
          } else if (userAnswers.includes(index)) {
            if (highlighted.includes(index)) {
              boxClass += " correct"; // doğru
            } else {
              boxClass += " wrong"; // yanlış
            }
          }

          return (
            <div
              key={index}
              className={boxClass}
              onClick={() => handleClick(index)}
            />
          );
        })}
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
