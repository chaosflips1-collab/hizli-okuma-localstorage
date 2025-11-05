import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lastLogin, setLastLogin] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const ref = doc(db, "admins", "mainAdmin");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setLastLogin(snap.data().lastLogin || "Kayıt bulunamadı");
        }
      } catch (err) {
        console.error("Admin bilgisi alınamadı:", err);
      }
    };
    fetchAdmin();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const ref = doc(db, "admins", "mainAdmin");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setError("⚠️ Admin kaydı bulunamadı!");
        return;
      }

      const adminData = snap.data();
      if (adminData.username === username && adminData.password === password) {
        await updateDoc(ref, {
          lastLogin: new Date().toLocaleString("tr-TR"),
          updatedAt: serverTimestamp(),
        });
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminUser", username);
        navigate("/admin/panel", { replace: true });
      } else {
        setError("❌ Kullanıcı adı veya şifre yanlış!");
      }
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError("⚠️ Giriş sırasında bir hata oluştu!");
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <h1>🧠 SmartQ Admin Girişi</h1>
        <p>Yönetici erişimi için kullanıcı adı ve şifrenizi girin</p>

        <input
          type="text"
          placeholder="👤 Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="🔑 Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">🚀 Giriş Yap</button>

        {lastLogin && (
          <div className="last-login">
            <span>🕒 Son Giriş:</span> <b>{lastLogin}</b>
          </div>
        )}
      </form>
    </div>
  );
}
