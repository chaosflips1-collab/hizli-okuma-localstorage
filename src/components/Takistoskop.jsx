import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Takistoskop() {
  const navigate = useNavigate();

  // Ayarlar
  const [material, setMaterial] = useState("harf");
  const [mode, setMode] = useState("manuel");
  const [speed, setSpeed] = useState(1000);
  const [level, setLevel] = useState(1);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(32);

  // Egzersiz state
  const [currentItem, setCurrentItem] = useState("");
  const [answer, setAnswer] = useState("");
  const [showItem, setShowItem] = useState(false);

  // Skor state
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  // Materyal listeleri
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
  const words = ["masa", "kitap", "araba", "çocuk", "okul", "kalem"];

  const getRandomItem = () => {
    if (material === "harf") {
      return letters[Math.floor(Math.random() * letters.length)];
    } else if (material === "rakam") {
      return numbers[Math.floor(Math.random() * numbers.length)];
    } else {
      return words[Math.floor(Math.random() * words.length)];
    }
  };

  const startExercise = () => {
    setRunning(true);
    setTime(0);
    const item = getRandomItem();
    setCurrentItem(item);
    setShowItem(true);

    setTimeout(() => {
      setShowItem(false);
    }, speed);
  };

  const checkAnswer = () => {
    if (!answer.trim()) {
      alert("Yanıt vermediniz!");
      return;
    }

    if (answer.trim().toLowerCase() === currentItem.toString().toLowerCase()) {
      setCorrect(correct + 1);
      setScore(score + 10);
      if (score + 10 > record) setRecord(score + 10);
      if ((correct + 1) % 3 === 0 && level < 10) {
        setLevel(level + 1);
      }
    } else {
      setWrong(wrong + 1);
    }
    setAnswer("");

    const newItem = getRandomItem();
    setCurrentItem(newItem);
    setShowItem(true);

    setTimeout(() => {
      setShowItem(false);
    }, speed);
  };

  // Zaman sayacı (5 dk sınır → sonra diğer egzersize geçiş)
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;

          // Hız değişimleri
          if (newTime === 120) setSpeed(800); // 2. dakikadan sonra hızlan
          if (newTime === 240) setSpeed(600); // 4. dakikadan sonra daha da hızlan

          if (newTime >= 300) {
            clearInterval(interval);
            setRunning(false);
            alert("Bugünkü Takistoskop egzersizi sona erdi!");
            navigate("/kosesel"); // 👉 Sonraki egzersiz
            return prev;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, navigate]);

  // Çıkış → Panele dön
  const exitExercise = () => {
    setRunning(false);
    setCurrentItem("");
    setAnswer("");
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel"); // 👉 Çıkış yapan öğrenci Panel'e döner
  };

  return (
    <div style={{ textAlign: "center", margin: "20px", fontFamily: "Arial" }}>
      <h2>Takistoskop Çalışması</h2>

      {/* Üst Alan */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        {/* Gösterim Alanı + Yanıt */}
        <div
          style={{
            width: "500px",
            border: "2px solid #333",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              height: "150px",
              backgroundColor: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: font,
              fontSize: `${fontSize}px`,
              borderBottom: "2px solid #333",
            }}
          >
            {showItem ? currentItem : ""}
          </div>
          <div style={{ padding: "10px" }}>
            <p>Yanıtınız?</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{ padding: "5px", fontSize: "16px" }}
              disabled={!running}
            />
            <button
              onClick={checkAnswer}
              style={{ marginLeft: "10px", padding: "5px 10px" }}
              disabled={!running}
            >
              Tamam
            </button>
          </div>
        </div>

        {/* Başarı Tablosu */}
        <div
          style={{
            width: "200px",
            border: "2px solid #333",
            padding: "10px",
            textAlign: "left",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          <h4>Başarı Tablosu</h4>
          <p>Doğru: {correct}</p>
          <p>Yanlış: {wrong}</p>
          <p>Skor: {score}</p>
          <p>Rekor: {record}</p>
          <p>Kalan Süre: {(300 - time).toFixed(0)} sn</p>
          <p>Hız: {speed} ms</p>
        </div>
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
                    level > lvl
                      ? "green"
                      : level === lvl
                      ? "yellow"
                      : "white",
                  fontSize: "14px",
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
          <label>Materyal: </label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            disabled={running}
          >
            <option value="harf">Harf</option>
            <option value="kelime">Kelime</option>
            <option value="rakam">Rakam</option>
          </select>
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Çalışma Şekli: </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={running}
          >
            <option value="otomatik">Otomatik</option>
            <option value="manuel">Manuel</option>
            <option value="rastgele">Rastgele</option>
          </select>
        </div>
        <div style={{ margin: "10px 0" }}>
          <label>Hız (ms): </label>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={running}
          />
          <span> {speed} ms</span>
        </div>
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
