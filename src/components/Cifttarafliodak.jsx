// src/components/Cifttarafliodak.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import library from "../data/library.json";
import completeExercise from "../utils/completeExercise";
import "./Cifttarafliodak.css";

export default function Cifttarafliodak() {
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

  // 🔎 Sınıftan (ör. "6A") sayısal seviye çıkar: 5/6/7
  const gradeLevel = useMemo(() => {
    const m = String(student?.sinif || "").match(/(\d+)/);
    const n = m ? parseInt(m[1], 10) : 6;
    if (n >= 7) return "7";
    if (n >= 6) return "6";
    return "5";
  }, [student?.sinif]);

  // 📚 Kelime havuzu (önce sınıfa uygun, yoksa birleşik, yine yoksa emniyet)
  const pool = useMemo(() => {
    const src = library?.ciftTarafliOdak || {};
    let arr = src[gradeLevel] || [];
    if (!arr?.length) {
      arr = [...(src["5"] || []), ...(src["6"] || []), ...(src["7"] || [])];
    }
    if (!arr.length) arr = ["dikkat", "odak", "renk", "şekil"];
    return arr;
  }, [gradeLevel]);

  const [running, setRunning] = useState(false);
  const [words, setWords] = useState(["", ""]);
  const [score, setScore] = useState(0);

  // ⏲ egzersiz toplam süresi (erken bitirme YOK)
  const duration = 180; // saniye
  const [time, setTime] = useState(0);

  // 🔄 tur içi geri sayım (her tur 3 sn)
  const [roundTimer, setRoundTimer] = useState(3);
  const [round, setRound] = useState(1);

  // tek seferlik tamamlama kilidi
  const [finishing, setFinishing] = useState(false);

  const generateWords = () => {
    if (!pool.length) return setWords(["", ""]);
    const w1 = pool[Math.floor(Math.random() * pool.length)];
    const same = Math.random() < 0.4;
    const w2 = same ? w1 : pool[Math.floor(Math.random() * pool.length)];
    setWords([w1, w2]);
  };

  const startExercise = () => {
    if (!pool.length) return;
    setRunning(true);
    setScore(0);
    setRound(1);
    setTime(0);
    setRoundTimer(3);
    generateWords();
  };

  // ⏱ global süre (her zaman saniye sayar)
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

  // 🔁 3 sn'lik tur döngüsü (kelimeleri yeniler)
  useEffect(() => {
    if (!running) return;
    const c = setInterval(() => {
      setRoundTimer((t) => {
        if (t <= 1) {
          // tur bitti → yeni tur
          setRound((r) => r + 1);
          generateWords();
          return 3;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(c);
  }, [running, pool.length]);

  // 🎯 süre dolunca otomatik tamamla (erken bitirme yok)
  useEffect(() => {
    if (!running) return;
    if (time >= duration && !finishing) {
      (async () => {
        try {
          setFinishing(true);
          setRunning(false);
          alert(`🏆 Egzersiz bitti! Toplam Puan: ${score}`);
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
  }, [time, duration, running, finishing, score, student.kod, student.sinif, navigate]);

  // ✅ Cevap butonu: yalnızca aynıysa puan
  const handleAnswer = () => {
    if (!running) return;
    if (words[0] && words[0] === words[1]) {
      setScore((s) => s + 1);
    }
    // yeni tura hızla geç
    setRound((r) => r + 1);
    setRoundTimer(3);
    generateWords();
  };

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
    <div className="cift-container">
      <h2>🔁 Çift Taraflı Odak Egzersizi</h2>

      {!running ? (
        <div className="menu">
          <button className="start-btn" onClick={startExercise} disabled={!pool.length}>
            ▶ Başlat
          </button>
          <button className="exit-btn" onClick={exitExercise}>
            ❌ Çıkış
          </button>
          {!pool.length && <p className="warning">⚠ Bu sınıf için henüz kelime eklenmedi.</p>}
        </div>
      ) : (
        <div className="game">
          <div className="word-boxes">
            <div className="word-box">{words[0]}</div>
            <div className="word-box">{words[1]}</div>
          </div>

          <div className="stats">
            <p>⏳ Kalan Süre: {Math.max(0, duration - time)} sn</p>
            <p>🕒 Tur Sayacı: {roundTimer} sn</p>
            <p>🏅 Puan: {score}</p>
            <p>🔄 Tur: {round}</p>
          </div>

          <button className="answer-btn" onClick={handleAnswer}>
            ✅ Aynıysa Tıkla
          </button>

          <button className="exit-btn" onClick={exitExercise} style={{ marginTop: 15 }}>
            ❌ Çıkış
          </button>
        </div>
      )}
    </div>
  );
}
