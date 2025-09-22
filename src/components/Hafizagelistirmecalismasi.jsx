import React, { useState } from "react";

export default function Hafizagelistirmecalismasi() {
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

    // 1 saniye sonra kutuları gizle
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

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>🧠 Hafıza Geliştirme Çalışması</h2>
      <button
        onClick={startGame}
        style={{
          padding: "10px 20px",
          background: "blue",
          color: "white",
          borderRadius: "8px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        Başla
      </button>

      {/* Kareler */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 60px)`,
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          let bg = "#eee";

          if (showing && highlighted.includes(index)) {
            bg = "yellow"; // gösterim sırasında sarı
          } else if (userAnswers.includes(index)) {
            if (highlighted.includes(index)) {
              bg = "green"; // doğru
            } else {
              bg = "red"; // yanlış
            }
          }

          return (
            <div
              key={index}
              onClick={() => handleClick(index)}
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: bg,
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            />
          );
        })}
      </div>

      {/* Skor Tablosu */}
      <div
        style={{
          marginTop: "20px",
          background: "#fff3cd",
          display: "inline-block",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #f0ad4e",
        }}
      >
        <h3>📊 Skor Tablosu</h3>
        <p>✅ Doğru: {score.correct}</p>
        <p>❌ Yanlış: {score.wrong}</p>
        <p>⭐ Puan: {score.points}</p>
      </div>
    </div>
  );
}
