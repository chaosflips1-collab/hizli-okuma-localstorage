// src/components/ExercisePlayer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import completeExercise from "../utils/completeExercise";
import "./ExercisePlayer.css";

/**
 * ExercisePlayer
 * - progress/{studentCode} → currentDay/currentExercise (index)
 * - plans/{className} → dayX.exercises[*] (id + duration)
 * - "Başla" → ilgili route'a navigate (state ile)
 * - "✅ Tamamla" → completeExercise() çağırır (ilerlemeyi günceller ve doğru yere yönlendirir)
 *
 * Props opsiyoneldir; gelmezse localStorage.activeStudent'tan okur:
 *   - studentCode
 *   - className
 */
export default function ExercisePlayer(props) {
  const navigate = useNavigate();

  // 1) Öğrenci bilgisini al
  const active = useMemo(() => {
    if (props?.studentCode && props?.className) {
      return { kod: props.studentCode, sinif: props.className };
    }
    try {
      const raw = localStorage.getItem("activeStudent");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [props?.studentCode, props?.className]);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null); // { currentDay, currentExercise, ... }
  const [plan, setPlan] = useState(null);         // { day1: {exercises: [...]}, ... }
  const [error, setError] = useState("");

  // 2) Firestore'dan progress ve planı getir
  useEffect(() => {
    const run = async () => {
      if (!active?.kod || !active?.sinif) {
        setError("Aktif öğrenci bulunamadı. Giriş yapınız.");
        setLoading(false);
        return;
      }
      try {
        const [progSnap, planSnap] = await Promise.all([
          getDoc(doc(db, "progress", active.kod)),
          getDoc(doc(db, "plans", active.sinif)),
        ]);

        if (!progSnap.exists()) {
          setError("İlerleme kaydı bulunamadı. Panele dönüp tekrar deneyin.");
          setLoading(false);
          return;
        }
        if (!planSnap.exists()) {
          setError(`Plan (${active.sinif}) bulunamadı. Admin panelinden plan oluşturulmalı.`);
          setLoading(false);
          return;
        }

        setProgress(progSnap.data());
        setPlan(planSnap.data());
      } catch (e) {
        console.error("ExercisePlayer fetch error:", e);
        setError("Veriler yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [active?.kod, active?.sinif]);

  // 3) Gün ve egzersiz bilgisi
  const dayKey = useMemo(() => (progress ? `day${progress.currentDay}` : null), [progress]);
  const exercises = useMemo(() => {
    if (!plan || !dayKey) return [];
    const dayObj = plan[dayKey];
    // createPlan() formatı: { day: number, exercises: [{id, duration}...] }
    // eski seed formatı da {exercises: [...] } şeklindeydi → her ikisini de destekleyelim:
    return dayObj?.exercises || dayObj || [];
  }, [plan, dayKey]);

  const currentIndex = progress?.currentExercise ?? 0;
  const current = exercises?.[currentIndex];

  // 4) UI durumları
  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 32 }}>⏳ Yükleniyor...</p>;
  }
  if (error) {
    return (
      <div className="exercise-player" style={{ textAlign: "center" }}>
        <p style={{ color: "#c62828", fontWeight: 600 }}>⚠️ {error}</p>
        <button className="start-btn" onClick={() => navigate("/panel")}>⬅ Panele Dön</button>
      </div>
    );
  }
  if (!current) {
    return (
      <div className="exercise-player" style={{ textAlign: "center" }}>
        <p>🎉 Bugünkü egzersizlerin bu kısmı tamamlandı!</p>
        <button className="start-btn" onClick={() => navigate("/panel")}>⬅ Panele Dön</button>
      </div>
    );
  }

  // 5) Başlat & Tamamla
  const handleStart = () => {
    // Not: progress.currentExercise’i burada asla yazmıyoruz (index). Sadece navigate.
    navigate(`/${current.id}`, {
      state: {
        fromExercisePlayer: true,
        studentCode: active.kod,
        className: active.sinif,
        duration: current.duration ?? 180,
      },
    });
  };

  const handleComplete = async () => {
    try {
      await completeExercise(active.kod, active.sinif, navigate);
      // completeExercise gereken yere yönlendirir (sıradaki egzersiz/oyun/panel)
    } catch (e) {
      console.error("completeExercise hata:", e);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="exercise-player">
      <div className="ep-card">
        <p className="ep-title">📘 Gün {progress.currentDay} — Egzersiz {currentIndex + 1}/{exercises.length}</p>
        <p className="ep-name">
          <b>Egzersiz:</b> {current.id} {current.duration ? `• ${current.duration}s` : ""}
        </p>
        <div className="ep-actions">
          <button className="start-btn" onClick={handleStart}>▶ Başla</button>
          <button className="complete-btn" onClick={handleComplete}>✅ Tamamla</button>
        </div>
        <div className="ep-meta">
          <div><b>Öğrenci:</b> {active.kod} • {active.sinif}</div>
        </div>
      </div>
    </div>
  );
}
