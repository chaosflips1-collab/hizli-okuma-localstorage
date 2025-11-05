// src/components/CompleteExerciseButton.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import completeExercise from "../utils/completeExercise";

export default function CompleteExerciseButton({
  label = "✅ Egzersizi Bitir",
  className = "finish-btn",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // aktif öğrenci bilgisi: önce route state, sonra localStorage
  const active = useMemo(() => {
    const s = location.state;
    if (s?.studentCode && s?.className) {
      return { kod: s.studentCode, sinif: s.className };
    }
    try {
      const raw = localStorage.getItem("activeStudent");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  const handleFinish = async () => {
    if (!active?.kod || !active?.sinif) {
      alert("⚠️ Öğrenci bilgisi bulunamadı. Lütfen yeniden giriş yap.");
      navigate("/", { replace: true });
      return;
    }
    try {
      setLoading(true);
      await completeExercise(active.kod, active.sinif, navigate);
      // completeExercise doğru yere yönlendirecek
    } catch (e) {
      console.error("completeExercise hata:", e);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFinish}
      disabled={loading}
      className={className}
      style={{
        display: "block",
        width: "80%",
        margin: "16px auto",
        padding: "12px 16px",
        border: "none",
        borderRadius: 12,
        background: "#4caf50",
        color: "#fff",
        fontWeight: 700,
        fontSize: "1rem",
        boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "⏳ Kaydediliyor..." : label}
    </button>
  );
}
