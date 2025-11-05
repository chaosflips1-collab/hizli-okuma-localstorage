// src/components/Odaklanma.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise";
import "./Odaklanma.css";

export default function Odaklanma() {
  const navigate = useNavigate();
  const student = JSON.parse(localStorage.getItem("activeStudent") || "{}");

  const [numbers, setNumbers] = useState([0, 0, 0, 0]);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const duration = 180; // 3 dk
  const timerRef = useRef(null);

  const start = () => {
    setNumbers([
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
    ]);
    setTime(0);
    setRunning(true);
  };

  const stop = () => setRunning(false);

  useEffect(() => {
    const clear = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (running) {
      clear();
      timerRef.current = setInterval(() => {
        setNumbers([
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
        ]);

        setTime((prev) => {
          const t = prev + 1;
          if (t >= duration) {
            clear();
            setRunning(false);
            alert("🎯 Odaklanma Egzersizi tamamlandı!");
            completeExercise(student.kod, student.sinif, navigate);
          }
          return t;
        });
      }, 1000);
    } else {
      clear();
    }

    return () => clear();
  }, [running, duration, navigate, student.kod, student.sinif]);

  const handleExit = () => {
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="odak-container">
      <h2 className="odak-title">🎯 Odaklanma Çalışması</h2>
      <p className="odak-desc">
        Ortadaki kırmızı noktaya odaklan. Çevresindeki rakamlar değişirken dikkatin dağılmadan odakta kal.
      </p>

      <div className="odak-shape">
        <div className="odak-number top">{numbers[0]}</div>
        <div className="odak-number left">{numbers[1]}</div>
        <div className="odak-center"></div>
        <div className="odak-number right">{numbers[2]}</div>
        <div className="odak-number bottom">{numbers[3]}</div>
      </div>

      <div className="odak-info">
        <p>⏳ Süre: {Math.max(0, duration - time)} sn</p>
      </div>

      <div className="odak-buttons">
        <button className="start-btn" onClick={start} disabled={running}>
          ▶ Başlat
        </button>
        <button className="stop-btn" onClick={stop} disabled={!running}>
          ⏸ Durdur
        </button>
        <button className="exit-btn" onClick={handleExit}>
          ❌ Çıkış
        </button>
      </div>
    </div>
  );
}
