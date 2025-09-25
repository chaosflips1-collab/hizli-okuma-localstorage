// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import "./Login.css";

export default function Login() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔍 Firestore'da kodu ara (şimdilik sadece kontrol için)
      const q = query(collection(db, "codes"), where("code", "==", code));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("❌ Kod bulunamadı!");
        return;
      }

      const docSnap = snap.docs[0];
      const docRef = docSnap.ref;
      const data = docSnap.data();

      // ⚠ Eğer kod daha önce bir öğrenciye atanmışsa
      if (data.lockedTo && data.lockedTo.name) {
        if (
          data.lockedTo.name !== name ||
          data.lockedTo.surname !== surname ||
          data.lockedTo.className !== className
        ) {
          setError("❌ Bu kod zaten kullanılıyor!");
          return;
        }
      }

      // 🔄 Firestore güncelle (ileride aktif olacak)
      await updateDoc(docRef, {
        lockedTo: { name, surname, className },
        startedAt: data.startedAt ? data.startedAt : serverTimestamp(),
        progress: data.progress || 0,
      });

      await setDoc(doc(db, "students", code), {
        code,
        name,
        surname,
        className,
        progress: data.progress || 0,
        startedAt: data.startedAt ? data.startedAt : serverTimestamp(),
      });

      // ✅ LocalStorage senkronizasyonu → AdminPanel görecek
      let codes = JSON.parse(localStorage.getItem("codes")) || [];

      // Eğer kod yoksa ekle
      if (!codes.find((c) => c.code === code)) {
        codes.push({ code, lockedTo: { name, surname, className } });
      } else {
        // varsa güncelle
        codes = codes.map((c) =>
          c.code === code
            ? { ...c, lockedTo: { name, surname, className } }
            : c
        );
      }

      localStorage.setItem("codes", JSON.stringify(codes));

      // ✅ Öğrenci paneline yönlendir
      navigate("/panel", {
        state: { code, name, surname, className },
      });
    } catch (err) {
      console.error("Login error:", err);
      setError("⚠ Bir hata oluştu!");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>🎓 Öğrenci Girişi</h2>

        <input
          type="text"
          placeholder="🔑 Kod"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="😀 Ad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="😊 Soyad"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="🏫 Sınıf (örn: 5/A)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit">🚀 Giriş Yap</button>

        {/* 🔑 Admin Girişi butonu */}
        <div className="admin-link">
          <Link to="/admin-login">🔑 Admin Girişi</Link>
        </div>
      </form>
    </div>
  );
}
