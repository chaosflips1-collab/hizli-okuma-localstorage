// src/components/Buyuyensekil.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise";
import library from "../data/library.json";
import "./Buyuyensekil.css";

export default function Buyuyensekil() {
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

  const [running, setRunning] = useState(false);
  const [letters, setLetters] = useState(["a", "b", "c", "d"]);
  const [size, setSize] = useState(100);
  const [intervalMs, setIntervalMs] = useState(1000); // sadece şeklin büyüme/döngü hızı
  const [time, setTime] = useState(0);                // gerçek saniye sayacı
  const duration = 180;                                // 3 dk (erken bitirme yok)
  const [finishing, setFinishing] = useState(false);   // çifte tamamlamayı önler

  const pool = library?.letters || [];

  const randomLetter = () => {
    if (!pool.length) return "•";
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const newLetters = () => [randomLetter(), randomLetter(), randomLetter(), randomLetter()];

  // ▶ Başlat/Durdur
  const handleToggle = () => {
    if (!running) {
      setSize(100);
      setLetters(newLetters());
      setTime(0);
      setRunning(true);
    } else {
      setRunning(false);
    }
  };

  // ⏲ Saniye sayacı (intervalMs'den BAĞIMSIZ)
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((prev) => {
        const next = prev + 1;
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // 🔁 Şekil büyütme ve harf yenileme (intervalMs'e bağlı)
  useEffect(() => {
    if (!running) return;
    const loop = setInterval(() => {
      setSize((prev) => {
        if (prev >= 300) {
          setLetters(newLetters());
          return 100;
        }
        setLetters(newLetters());
        return prev + 20;
      });
    }, Math.max(200, intervalMs)); // aşırı düşük değerleri sınırlayalım
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
          alert("📏 Büyüyen Şekil Egzersizi tamamlandı!");
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

  const handleExit = () => {
    if (running) {
      const ok = window.confirm("⚠️ Egzersiz devam ediyor. Çıkarsan tamamlanmış sayılmaz. Emin misin?");
      if (!ok) return;
    }
    setRunning(false);
    navigate("/panel");
  };

  return (
    <div className="buyuyen-container">
      <h2>📏 Büyüyen Şekil Egzersizi</h2>
      <p>Şekil büyüdükçe kenarlardaki harfleri gözünle yakalamaya çalış.</p>

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
        <button onClick={handleToggle}>{running ? "⏸ Durdur" : "▶ Başlat"}</button>
        <button className="exit-btn" onClick={handleExit}>❌ Çıkış</button>
      </div>

      {/* Şekil */}
      <div className="shape" style={{ width: `${size}px`, height: `${size / 2}px` }}>
        <div className="center-dot"></div>

        <div className="letter top">{letters[0]}</div>
        <div className="letter bottom">{letters[1]}</div>
        <div className="letter left">{letters[2]}</div>
        <div className="letter right">{letters[3]}</div>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {Math.max(0, duration - time)} sn</p>
      </div>
    </div>
  );
}
