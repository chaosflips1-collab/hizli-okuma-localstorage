// src/components/Gozoyunu.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise";
import "./Gozoyunu.css";

export default function Gozoyunu() {
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

  const positions = ["top-left", "top-right", "bottom-right", "bottom-left"];
  const emojis = ["😵", "🤓", "😎", "🐱", "🐸", "🐧", "🦊", "🐶"];

  const [position, setPosition] = useState("top-left");
  const [running, setRunning] = useState(false);

  // ⏱ hız sadece emojinin hareket hızını belirler (ms)
  const [speed, setSpeed] = useState(1000);

  // ⏲ gerçek saniye sayacı (speed’ten bağımsız)
  const [time, setTime] = useState(0);
  const duration = 180; // 3 dk — erken bitirme YOK

  const [emoji, setEmoji] = useState("😵");

  // çifte tamamlamayı önle
  const [finishing, setFinishing] = useState(false);

  // ▶ Başlat
  const start = () => {
    setTime(0);
    setPosition("top-left");
    setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    setRunning(true);
  };

  // ⏲ Saniye sayacı (her zaman 1 sn artar)
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // 🔁 Emojiyi dört köşede döndürme (speed’e bağlı)
  useEffect(() => {
    if (!running) return;
    const loop = setInterval(() => {
      setPosition((prev) => {
        const currentIndex = positions.indexOf(prev);
        const nextIndex = (currentIndex + 1) % positions.length;
        return positions[nextIndex];
      });
      setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, Math.max(200, speed)); // aşırı düşük hızları sınırlayalım
    return () => clearInterval(loop);
  }, [running, speed]);

  // 🎯 Süre dolunca otomatik tamamlama (erken bitirme yok)
  useEffect(() => {
    if (!running) return;
    if (time >= duration && !finishing) {
      (async () => {
        try {
          setFinishing(true);
          setRunning(false);
          alert("👁️ Göz Oyunu tamamlandı!");
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
    <div className="goz-container">
      <h2>👀 Göz Kaslarını Geliştirme Çalışması</h2>
      <p>Ortadaki noktaya odaklan, emojiyi gözlerinle takip et.</p>

      {/* Butonlar */}
      <div className="buttons">
        <button className="start" onClick={start} disabled={running}>
          ▶ Başlat
        </button>
        <button className="stop" onClick={() => setRunning(false)} disabled={!running}>
          ⏸ Durdur
        </button>
        <button className="exit-btn" onClick={exitExercise}>
          ❌ Çıkış
        </button>
      </div>

      {/* Hız Ayarı */}
      <div className="speed-control">
        <label>⏱️ Hız: </label>
        <input
          type="range"
          min="300"
          max="3000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={running}
        />
        <span> {speed} ms</span>
      </div>

      {/* Oyun Alanı */}
      <div className="playground">
        <span className={`emoji ${position}`}>{emoji}</span>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {Math.max(0, duration - time)} sn</p>
      </div>
    </div>
  );
}
