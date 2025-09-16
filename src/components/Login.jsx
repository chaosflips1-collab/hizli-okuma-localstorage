// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function Login() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const q = query(
        collection(db, "students"),
        where("code", "==", code)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // öğrenci kaydını güncelle
        const studentRef = doc(db, "students", code);
        await setDoc(studentRef, {
          name,
          surname,
          className,
          code,
          updatedAt: serverTimestamp(),
        }, { merge: true });

        // bilgileri Panel'e gönder
        navigate("/panel", {
          state: {
            name,
            surname,
            className,
            code
          }
        });
      } else {
        setError("Kod bulunamadı!");
      }
    } catch (err) {
      console.error("Hata:", err);
      setError("Giriş sırasında hata oluştu.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          width: "300px",
          textAlign: "center",
        }}
      >
        <h2>Öğrenci Girişi</h2>
        <input
          type="text"
          placeholder="Kod"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Ad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Soyad"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Sınıf (örn: 5/A)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Giriş Yap</button>
      </form>
    </div>
  );
}
