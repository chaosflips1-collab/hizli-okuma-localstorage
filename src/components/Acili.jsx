import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Acili() {
  const navigate = useNavigate();

  // Egzersiz ayarları
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(32);

  // Egzersiz state
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [phase, setPhase] = useState("down"); // down → inward → outward
  const [letters, setLetters] = useState([]);

  // Hız state (dinamik olacak)
  const [speed, setSpeed] = useState(1000);

  // Harf listesi
  const pool = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

  // Rastgele harf oluştur
  const generateLetters = () => {
    let arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return arr;
  };

  // Egzersizi başlat
  const startExercise = () => {
    setRunning(true);
    setTime(0);
    setPhase("down");
    setLetters(generateLetters());
  };

  // Süre ve hız yönetimi
  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;

          // Hız artırma mantığı
          if (newTime <= 60) setSpeed(1000); // ilk 1 dk
          else if (newTime <= 120) setSpeed(700); // 2. dk
          else setSpeed(500); // 3. dk

          // Phase değiştir
          if (newTime % 3 === 0) {
            setPhase((prevPhase) =>
              prevPhase === "down"
                ? "inward"
                : prevPhase === "inward"
                ? "outward"
                : "down"
            );
            setLetters(generateLetters());
          }

          // 180 sn sonunda bitir
          if (newTime >= 180) {
            clearInterval(timer);
            setRunning(false);
            alert("Açılı Okuma Egzersizi tamamlandı!");
            navigate("/anlama"); // 👉 sonraki egzersize geçiş
            return prev;
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running, navigate]);

  // Çıkış
  const exitExercise = () => {
    setRunning(false);
    setLetters([]);
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel");
  };

  // Faz mantığına göre pozisyonlama
  const getLetterStyle = (index) => {
    const baseX = (index % 10) * 40 + 20;
    const baseY = Math.floor(index / 10) * 40 + 40;

    if (phase === "down") {
      return { top: `${baseY + 20}px`, left: `${baseX}px` };
    } else if (phase === "inward") {
      return { top: `${baseY}px`, left: `${200 + index * 20}px` };
    } else if (phase === "outward") {
      return { top: `${baseY}px`, left: `${index * 60}px` };
    }
    return {};
  };

  return (
    <div style={{ textAlign: "center", margin: "20px", fontFamily: "Arial" }}>
      <h2>Açılı Okuma Egzersizi</h2>

      {/* Harf Alanı */}
      <div
        style={{
          width: "600px",
          height: "300px",
          margin: "0 auto",
          border: "2px solid #333",
          backgroundColor: bgColor,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {letters.map((ltr, idx) => (
          <span
            key={idx}
            style={{
              position: "absolute",
              fontFamily: font,
              fontSize: `${fontSize}px`,
              fontWeight: "bold",
              ...getLetterStyle(idx),
            }}
          >
            {ltr}
          </span>
        ))}
      </div>

      {/* Başarı Tablosu */}
      <div
        style={{
          width: "200px",
          border: "2px solid #333",
          padding: "10px",
          margin: "20px auto",
          textAlign: "left",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <h4>Başarı Tablosu</h4>
        <p>Kalan Süre: {180 - time} sn</p>
        <p>Hız: {speed} ms</p>
      </div>

      {/* İstatistik Tablosu */}
      <div style={{ marginTop: "20px" }}>
        <h3>İstatistik Tablosu</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
          {Array.from({ length: 10 }, (_, i) => {
            const lvl = i + 1;
            return (
              <div
                key={lvl}
                style={{
                  width: "30px",
                  height: "30px",
                  border: "1px solid #333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    time / 18 >= lvl
                      ? "green"
                      : time / 18 + 1 === lvl
                      ? "yellow"
                      : "white",
                }}
              >
                {lvl}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ayarlar */}
      <div
        style={{
          marginTop: "20px",
          border: "2px solid #333",
          padding: "15px",
          width: "500px",
          marginLeft: "auto",
          marginRight: "auto",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <h4>Ayarlar Menüsü</h4>
        <div style={{ margin: "10px 0" }}>
          <label>Zemin Renk: </label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            disabled={running}
          />
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Font: </label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            disabled={running}
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Font Boyutu: </label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min="16"
            max="72"
            disabled={running}
          />
        </div>
      </div>

      {/* Butonlar */}
      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "15px 40px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "6px",
            marginRight: "10px",
            cursor: "pointer",
          }}
          onClick={startExercise}
          disabled={running}
        >
          ✔ Başla
        </button>
        <button
          style={{
            padding: "15px 40px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={exitExercise}
        >
          ❌ Çıkış
        </button>
      </div>
    </div>
  );
}
