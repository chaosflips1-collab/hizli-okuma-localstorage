// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

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
      // codes koleksiyonunda kodu ara
      const q = query(collection(db, "codes"), where("code", "==", code));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("❌ Kod bulunamadı!");
        return;
      }

      const docSnap = snap.docs[0];
      const docRef = docSnap.ref;
      const data = docSnap.data();

      // Kod başka birine kilitlenmiş mi?
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

      // codes güncelle
      await updateDoc(docRef, {
        lockedTo: { name, surname, className },
        startedAt: data.startedAt ? data.startedAt : serverTimestamp(),
        progress: data.progress || 0,
      });

      // students koleksiyonuna ekle/güncelle
      await setDoc(doc(db, "students", code), {
        code,
        name,
        surname,
        className,
        progress: data.progress || 0,
        startedAt: data.startedAt ? data.startedAt : serverTimestamp(),
      });

      // Panel'e yönlendir, öğrenci bilgilerini state ile taşı
      navigate("/panel", {
        state: { code, name, surname, className },
      });
    } catch (err) {
      console.error("Login error:", err);
      setError("⚠ Bir hata oluştu!");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
          textAlign: "center",
          width: "320px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>🎓 Öğrenci Girişi</h2>

        <input type="text" placeholder="Kod" value={code} onChange={(e) => setCode(e.target.value)} required />
        <input type="text" placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Soyad" value={surname} onChange={(e) => setSurname(e.target.value)} required />
        <input type="text" placeholder="Sınıf (örn: 5/A)" value={className} onChange={(e) => setClassName(e.target.value)} required />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={{ backgroundColor: "#007bff", color: "white", padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          🚀 Giriş Yap
        </button>
      </form>
    </div>
  );
}
