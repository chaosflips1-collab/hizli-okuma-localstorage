import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise"; // ✅ eklendi
import "./Hafizagelistirmecalismasi.css";

export default function Hafizagelistirmecalismasi() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const gridSize = 5; // 5x5 kare
  const [highlighted, setHighlighted] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState({ correct: 0, wrong: 0, points: 0 });
  const [round, setRound] = useState(0);
  const [showing, setShowing] = useState(false);

  const startGame = () => {
    if (round >= 8) {
      alert("🧠 Hafıza Geliştirme Çalışması tamamlandı!");
      completeExercise(student.kod, student.sinif, navigate); // ✅ Firestore ilerlemesi
      return;
    }

    const randomBoxes = [];
    while (randomBoxes.length < 3) {
      const random = Math.floor(Math.random() * gridSize * gridSize);
      if (!randomBoxes.includes(random)) randomBoxes.push(random);
    }

    setHighlighted(randomBoxes);
    setUserAnswers([]);
    setShowing(true);
    setTimeout(() => setShowing(false), 1000);
  };

  const handleClick = (index) => {
    if (userAnswers.includes(index)) return;

    const updatedAnswers = [...userAnswers, index];
    setUserAnswers(updatedAnswers);

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

    // ✅ Tüm tıklamalar bitince yeni tur
    if (updatedAnswers.length >= 3) {
      setRound((r) => {
        const newRound = r + 1;
        if (newRound >= 8) {
          alert("🧩 Egzersiz tamamlandı!");
          completeExercise(student.kod, student.sinif, navigate);
        } else {
          startGame();
        }
        return newRound;
      });
    }
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

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          let boxClass = "box";

          if (showing && highlighted.includes(index)) {
            boxClass += " highlight";
          } else if (userAnswers.includes(index)) {
            boxClass += highlighted.includes(index) ? " correct" : " wrong";
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

      <div className="score-board">
        <h3>📊 Skor Tablosu</h3>
        <p>✅ Doğru: {score.correct}</p>
        <p>❌ Yanlış: {score.wrong}</p>
        <p>⭐ Puan: {score.points}</p>
        <p>🌀 Tur: {round}/8</p>
      </div>
    </div>
  );
}
