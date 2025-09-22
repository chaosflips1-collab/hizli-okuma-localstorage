// src/components/Harfbulmaodakcalismasi.jsx
import React, { useState, useEffect } from "react";

export default function Harfbulmaodakcalismasi() {
  const [numbers, setNumbers] = useState([]);
  const [target, setTarget] = useState(null);
  const [visible, setVisible] = useState(false);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState({ correct: 0, wrong: 0, points: 0 });

  // Yeni round başlat
  const startGame = () => {
    // 5–8 arasında sayı adedi belirle
    const count = Math.floor(Math.random() * 4) + 5;

    // Rastgele sayılar
    const newNumbers = Array.from({ length: count }, () =>
      Math.floor(Math.random() * 9) + 1
    );

    // Hedef sayıyı seç
    const randomTarget = newNumbers[Math.floor(Math.random() * newNumbers.length)];

    setNumbers(newNumbers);
    setTarget(randomTarget);
    setVisible(true);

    // 3 saniye sonra sayılar kaybolsun
    setTimeout(() => setVisible(false), 3000);

    // Cevap sıfırlansın
    setAnswer("");
  };

  // Kontrol et
  const checkAnswer = () => {
    const count = numbers.filter((n) => n === target).length;
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

  return (
    <div style={{ textAlign: "center", padding: "40px", fontFamily: "Comic Sans MS" }}>
      <h2>🔍 Harf Bulma Odak Çalışması</h2>

      {/* Sayılar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          minHeight: "150px",
          border: "2px dashed green",
          borderRadius: "10px",
          margin: "20px auto",
          width: "80%",
          fontSize: "40px",
          padding: "20px",
        }}
      >
        {visible
          ? numbers.map((num, i) => (
              <span
                key={i}
                style={{
                  margin: "20px",
                  fontWeight: "bold",
                }}
              >
                {num}
              </span>
            ))
          : <p style={{ fontSize: "20px" }}>👀 Kaç tane <b>{target}</b> vardı?</p>}
      </div>

      {/* Yanıt kutusu */}
      {!visible && target !== null && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="number"
            placeholder="Adet sayısını gir"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ padding: "10px", fontSize: "18px", width: "120px" }}
          />
          <button
            onClick={checkAnswer}
            style={{
              padding: "10px 20px",
              marginLeft: "10px",
              fontSize: "18px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ✅ Kontrol Et
          </button>
        </div>
      )}

      {/* Başlat butonu */}
      <div>
        <button
          onClick={startGame}
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "18px",
            backgroundColor: "dodgerblue",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ▶️ Başlat
        </button>
      </div>

      {/* Skor Tablosu */}
      <div
        style={{
          marginTop: "30px",
          border: "2px solid orange",
          display: "inline-block",
          padding: "15px",
          borderRadius: "10px",
          backgroundColor: "#fffbe6",
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
