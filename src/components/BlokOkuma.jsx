// src/components/BlokOkuma.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise";
import "./BlokOkuma.css";
import library from "../data/library.json";

export default function BlokOkuma() {
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

  // 🔎 Sınıftan (ör. "5A") sayısal seviye çıkaralım (5/6/7). Bulamazsak 5 kullan.
  const gradeLevel = useMemo(() => {
    const m = String(student?.sinif || "").match(/(\d+)/);
    const n = m ? parseInt(m[1], 10) : 5;
    if (n >= 7) return "7";
    if (n >= 6) return "6";
    return "5";
  }, [student?.sinif]);

  // 🔤 Blok havuzu: library.blokOkuma[5/6/7] öncelikli; yoksa birleşik; hiç yoksa fallback
  const initialBlocks = useMemo(() => {
    const src =
      library?.blokOkuma ||
      library?.blokokuma || // olası eski anahtar
      null;

    let list = [];
    if (src) {
      // Önce sınıfa uygun
      list = src[gradeLevel] || [];
      // Boşsa hepsini birleştir
      if (!list.length) {
        ["5", "6", "7"].forEach((k) => {
          if (Array.isArray(src[k])) list = list.concat(src[k]);
        });
      }
    }
    if (!list.length) {
      list = [
        "Zaman, doğru kullanıldığında bir hazinedir.",
        "Her gün biraz daha fazla öğrenmek mümkündür.",
        "Okumak, insanın ufkunu genişletir.",
        "Sabır, başarının en önemli anahtarıdır.",
      ];
    }
    return list;
  }, [gradeLevel]);

  const [running, setRunning] = useState(false);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [index, setIndex] = useState(0);

  // ⏱ gerçek zaman sayacı (saniye)
  const [time, setTime] = useState(0);
  const duration = 180; // 3 dakika, erken bitirme yok

  // 🔁 blok değişim hızı (ms) — sadece blok değişimini etkiler, süreyi değil
  const [speed, setSpeed] = useState(2000);

  // Çifte tamamlamayı önlemek için kilit
  const [finishing, setFinishing] = useState(false);

  // ▶ Egzersizi başlat
  const handleStart = () => {
    if (!blocks.length) return;
    setRunning(true);
    setIndex(0);
    setTime(0);
  };

  // ⏲ Saniye sayacı (her zaman 1 sn artar)
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((prev) => {
        const next = prev + 1;
        if (next >= duration) {
          clearInterval(t);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  // 🔁 Blok döndürme (speed ms’de bir)
  useEffect(() => {
    if (!running) return;
    const rot = setInterval(() => {
      setIndex((prev) => (prev + 1) % Math.max(1, blocks.length));
    }, Math.max(300, speed)); // çok düşük değerleri kısmen sınırla
    return () => clearInterval(rot);
  }, [running, speed, blocks.length]);

  // 🎯 Süre dolduğunda otomatik tamamlama (erken bitirme yok)
  useEffect(() => {
    if (!running) return;
    if (time >= duration && !finishing) {
      (async () => {
        try {
          setFinishing(true);
          alert("📚 Blok Okuma Egzersizi tamamlandı!");
          await completeExercise(student.kod, student.sinif, navigate);
        } catch (e) {
          console.error("completeExercise hata:", e);
          alert("Bir hata oluştu, panel’e dönülüyor.");
          navigate("/panel", { replace: true });
        } finally {
          setRunning(false);
          setFinishing(false);
        }
      })();
    }
  }, [time, duration, running, finishing, student.kod, student.sinif, navigate]);

  // ⛔ Çıkış (tamamlamaz)
  const handleExit = () => {
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
    <div className="blok-container">
      <h2>📚 Blok Okuma Egzersizi</h2>
      <p>Kelimeleri bloklar halinde hızlıca okumaya çalış.</p>

      <div className="controls">
        <label>Hız (ms):</label>
        <input
          type="range"
          min="500"
          max="4000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={running}
        />
        <span>{speed} ms</span>

        <button onClick={running ? () => setRunning(false) : handleStart}>
          {running ? "⏸ Durdur" : "▶ Başlat"}
        </button>

        <button className="exit-btn" onClick={handleExit}>
          ❌ Çıkış
        </button>
      </div>

      <div className="blok-box">
        <h3>{blocks[index]}</h3>
      </div>

      <div className="timer-box">
        <p>⏳ Kalan Süre: {Math.max(0, duration - time)} sn</p>
      </div>
    </div>
  );
}
