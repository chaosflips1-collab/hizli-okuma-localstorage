// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // 🔐 Local şifre kontrolü
    if (password === "12345") {
      navigate("/admin", { replace: true });
    } else {
      setError("❌ Yanlış şifre!");
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <h2>🔒 Admin Girişi</h2>
        <input
          type="password"
          placeholder="🔑 Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">🚀 Giriş Yap</button>
      </form>
    </div>
  );
}
