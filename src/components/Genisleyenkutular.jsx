// src/components/Genisleyenkutular.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise";
import library from "../data/library.json";
import "./Genisleyenkutular.css";

export default function Genisleyenkutular() {
  const navigate = useNavigate();

  // ✅ aktif öğrenci (güvenli JSON.parse)
  const student = useMemo(() => {
    try {
      const raw = localStorage.getItem("activeStudent");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const pool = library?.numbers || [];

  const [running, setRunning] = useState(false);
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [size, setSize] = useState(100);

  // 🔁 Görsel büyüme hızı (sadece animasyon; süreyi etkilemez)
  const [intervalMs, setIntervalMs] = useState(1000);

  // ⏲ Gerçek süre sayacı (saniye)
  const [time, setTime] = useState(0);
  const duration = 180; // 3 dk (erken bitirme yok)

  // Çifte tamamlama kilidi
  const [finishing, setFinishing] = useState(false);

  const randomNumber = () => {
    if (!Array.isArray(pool) || pool.length === 0) return "•";
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const regenNumbers = () => [
    randomNumber(),
    randomNumber(),
    randomNumber(),
    randomNumber(),
    randomNumber(),
  ];

  // ▶ Başlat/Durdur
  const handleToggle = () => {
    if (!running) {
      setNumbers(regenNumbers());
      setSize(100);
      setTime(0);
      setRunning(true);
    } else {
      setRunning(false);
    }
  };

  // ⏲ Saniye sayacı (her zaman 1 sn artar)
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // 🔁 Büyüme ve sayı yenileme (intervalMs'e bağlı)
  useEffect(() => {
    if (!running) return;
    const loop = setInterval(() => {
      setSize((prev) => {
        if (prev >= 300) {
          setNumbers(regenNumbers());
          return 100;
        }
        return prev + 20;
      });
    }, Math.max(200, intervalMs)); // aşırı düşük hızları sınırlayalım
    return () => clearInterval(loop);
  }, [running, intervalMs]);

  // 🎯 Süre dolunca otomatik tamamlama (erken bitirme yok)
  useEffect(() => {
    if (!running) return;
    if (time >= duration && !finishing) {
      (async () => {
        try {
          setFinishing(true);
          setRunning(false);
          alert("📦 Genişleyen Kutular Egzersizi tamamlandı!");
          await completeExercise(student.kod, student.sinif, navigate);
        } catch (e) {
          console.error("completeExercise hata:", e);
          alert("Bir hata oluştu, panel’e dönülüyor.");
          navigate("/panel", { replace: true });
        } finally {
          setFinishing(false);
        }
      })();
    }
  }, [time, duration, running, finishing, student.kod, student.sinif, navigate]);

  const exitExercise = () => {
    if (running) {
      const ok = window.confirm(
        "⚠️ Egzersiz devam ediyor. Çıkarsan tamamlanmış sayılmaz. Emin misin?"
      );
      if (!ok) return;
    }
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="genisleyen-container">
      <h2>📦 Genişleyen Kutular Egzersizi</h2>
      <p>Kutular büyüdükçe içindeki rakamları gözünle takip et.</p>

      <div className="controls">
        <label>Hız (ms): </label>
        <input
          type="number"
          min={200}
          max={4000}
          step={50}
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value))}
          disabled={running}
        />
        <button onClick={handleToggle}>
          {running ? "⏸ Durdur" : "▶ Başlat"}
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      {/* Kutular */}
      <div className="shapes" style={{ width: `${size}px`, height: `${size}px` }}>
        <div className="circle center">{numbers[2]}</div>
        <div className="circle top">{numbers[0]}</div>
        <div className="circle bottom">{numbers[1]}</div>
        <div className="circle left">{numbers[3]}</div>
        <div className="circle right">{numbers[4]}</div>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {Math.max(0, duration - time)} sn</p>
      </div>
    </div>
  );
}
