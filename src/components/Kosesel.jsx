import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Kosesel() {
  const navigate = useNavigate();

  // Ayarlar
  const [material, setMaterial] = useState("harf");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(48);
  const [speed, setSpeed] = useState(1000);

  // Egzersiz state
  const [leftItem, setLeftItem] = useState("");
  const [rightItem, setRightItem] = useState("");
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);

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
  };

  // Zaman sayacı ve hız kontrolü
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;

          // Hız değişimleri
          if (newTime === 60) setSpeed(800);
          if (newTime === 120) setSpeed(600);

          // Egzersiz bitiş (3 dakika = 180 saniye)
          if (newTime >= 180) {
            clearInterval(interval);
            setRunning(false);
            alert("Köşesel Egzersiz sona erdi!");
            navigate("/panel"); // 👉 Egzersiz sonrası panele dön
            return prev;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, navigate]);

  // Harf gösterimi (otomatik değişim)
  useEffect(() => {
    let changeInterval;
    if (running) {
      changeInterval = setInterval(() => {
        setLeftItem(getRandomItem());
        setRightItem(getRandomItem());
      }, speed);
    }
    return () => clearInterval(changeInterval);
  }, [running, speed, material]);

  const exitExercise = () => {
    setRunning(false);
    setLeftItem("");
    setRightItem("");
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel");
  };

  return (
    <div style={{ textAlign: "center", margin: "20px", fontFamily: "Arial" }}>
      <h2>Köşesel Çalışma</h2>

      {/* Panel */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            width: "200px",
            height: "150px",
            border: "2px solid #333",
            backgroundColor: bgColor,
            fontFamily: font,
            fontSize: `${fontSize}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {leftItem}
        </div>
        <div
          style={{
            width: "200px",
            height: "150px",
            border: "2px solid #333",
            backgroundColor: bgColor,
            fontFamily: font,
            fontSize: `${fontSize}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {rightItem}
        </div>
      </div>

      {/* Bilgi Tablosu */}
      <div
        style={{
          width: "300px",
          border: "2px solid #333",
          margin: "20px auto",
          padding: "10px",
          textAlign: "left",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <h4>Bilgi Tablosu</h4>
        <p>Kalan Süre: {(180 - time).toFixed(0)} sn</p>
        <p>Hız: {speed} ms</p>
      </div>

      {/* Ayarlar */}
      <div
        style={{
          marginTop: "20px",
          border: "2px solid #333",
          padding: "15px",
          width: "400px",
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
