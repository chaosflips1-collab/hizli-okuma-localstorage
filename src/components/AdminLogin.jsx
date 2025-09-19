// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Firestore'da settings/admin dokümanını kontrol et
      const ref = doc(db, "settings", "admin");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        if (data.password === password) {
          // ✅ Şifre doğru → admin paneline yönlendir
          navigate("/admin", { replace: true });
        } else {
          alert("❌ Yanlış şifre!");
        }
      } else {
        alert("⚠ Admin ayarı bulunamadı!");
      }
    } catch (err) {
      console.error("Hata:", err);
      alert("🔥 Giriş sırasında hata oluştu!");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to right, #fceabb, #f8b500)",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
          textAlign: "center",
          width: "300px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>🔒 Admin Girişi</h2>
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Giriş Yap
        </button>
      </form>
    </div>
  );
}
