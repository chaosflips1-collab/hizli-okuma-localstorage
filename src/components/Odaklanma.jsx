import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise"; // ✅ eklendi
import "./Odaklanma.css";

export default function Odaklanma() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [numbers, setNumbers] = useState([0, 0, 0, 0]);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [duration] = useState(180); // 3 dk

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setNumbers([
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
        ]);
        setTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            clearInterval(interval);
            setRunning(false);
            alert("🎯 Odaklanma Egzersizi tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate); // ✅ Firestore ilerlemesi
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, duration, student.kod, student.sinif, navigate]);

  const handleExit = () => {
    setRunning(false);
    alert("Egzersizden çıkış yapıldı.");
    navigate("/panel");
  };

  return (
    <div className="odak-container">
      <h2 className="odak-title">🎯 Odaklanma Çalışması</h2>
      <p className="odak-desc">
        Ortadaki kırmızı noktaya odaklan. Çevresindeki rakamlar değişirken
        dikkatin dağılmadan odakta kal.
      </p>

      {/* Şekil */}
      <div className="odak-shape">
        <div className="odak-number top">{numbers[0]}</div>
        <div className="odak-number left">{numbers[1]}</div>
        <div className="odak-center"></div>
        <div className="odak-number right">{numbers[2]}</div>
        <div className="odak-number bottom">{numbers[3]}</div>
      </div>

      <div className="odak-info">
        <p>⏳ Süre: {duration - time} sn</p>
      </div>

      <div className="odak-buttons">
        {!running ? (
          <button className="start-btn" onClick={() => setRunning(true)}>
            ▶ Başlat
          </button>
        ) : (
          <>
            <button className="stop-btn" onClick={() => setRunning(false)}>
              ⏸ Durdur
            </button>
            <button className="exit-btn" onClick={handleExit}>
              ❌ Çıkış
            </button>
          </>
        )}
      </div>
    </div>
  );
}
