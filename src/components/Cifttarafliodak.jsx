import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Cıfttaraflıodak() {
  const navigate = useNavigate();

  const [running, setRunning] = useState(false);
  const [words, setWords] = useState(["", ""]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(3);

  const pool = [
    "kitap", "kalem", "masa", "sandalye", "bilgisayar", "telefon", "defter",
    "okul", "öğrenci", "öğretmen", "bahçe", "şehir", "araba", "ev", "hayvan",
    "oyun", "su", "yemek", "pencere", "kapı"
  ];

  // ✅ Yeni kelimeler üret
  const generateWords = () => {
    const w1 = pool[Math.floor(Math.random() * pool.length)];
    const same = Math.random() < 0.4; // %40 ihtimalle aynı çıkar
    const w2 = same ? w1 : pool[Math.floor(Math.random() * pool.length)];
    setWords([w1, w2]);
  };

  // ✅ Başlat
  const startExercise = () => {
    setRunning(true);
    setScore(0);
    setRound(0);
    setMessage("");
    setTimer(3);
    generateWords();
  };

  // ✅ Sonraki tur
  useEffect(() => {
    if (!running) return;
    if (round >= 20) {
      setRunning(false);
      setMessage(`🏆 Oyun bitti! Toplam Puan: ${score}`);
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

  // ✅ Kullanıcı butona bastığında kontrol et
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
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #fceabb, #f8b500)",
        fontFamily: "Comic Sans MS",
        padding: "30px",
      }}
    >
      <h2>🔁 Çift Taraflı Odak Egzersizi</h2>

      {!running ? (
        <div>
          <button
            onClick={startExercise}
            style={{
              padding: "15px 40px",
              fontSize: "20px",
              fontWeight: "bold",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            ▶ Başlat
          </button>
          <button
            onClick={exitExercise}
            style={{
              padding: "15px 40px",
              fontSize: "20px",
              fontWeight: "bold",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            ❌ Çıkış
          </button>
        </div>
      ) : (
        <div>
          {/* Kelimeler */}
          <div style={{ display: "flex", justifyContent: "center", gap: "50px", marginTop: "40px" }}>
            <div
              style={{
                width: "200px",
                height: "100px",
                backgroundColor: "white",
                border: "3px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "bold",
                borderRadius: "12px",
              }}
            >
              {words[0]}
            </div>
            <div
              style={{
                width: "200px",
                height: "100px",
                backgroundColor: "white",
                border: "3px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "bold",
                borderRadius: "12px",
              }}
            >
              {words[1]}
            </div>
          </div>

          {/* Sayaç ve Puan */}
          <div style={{ marginTop: "20px" }}>
            <p>⏳ Kalan Süre: {timer} sn</p>
            <p>🏅 Puan: {score}</p>
            <p>🔄 Tur: {round}/20</p>
          </div>

          {/* Buton */}
          <button
            onClick={handleAnswer}
            style={{
              marginTop: "20px",
              padding: "15px 30px",
              fontSize: "20px",
              fontWeight: "bold",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            ✅ Aynıysa Tıkla
          </button>

          {/* Mesaj */}
          {message && <p style={{ marginTop: "15px", fontSize: "18px" }}>{message}</p>}
        </div>
      )}
    </div>
  );
}
