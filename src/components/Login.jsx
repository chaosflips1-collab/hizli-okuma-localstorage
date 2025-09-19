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
  addDoc,
  doc,
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
      // 1️⃣ Kod Firestore'da var mı?
      const q = query(collection(db, "codes"), where("code", "==", code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("⚠ Kod bulunamadı!");
        return;
      }

      const docSnap = querySnapshot.docs[0];
      const codeRef = doc(db, "codes", docSnap.id);
      const codeData = docSnap.data();

      // 2️⃣ Eğer kod boşsa → öğrenciye kilitle
      if (!codeData.lockedTo) {
        const studentData = {
          code,
          name,
          surname,
          className,
          createdAt: new Date(),
        };

        // Kod kilitleme
        await updateDoc(codeRef, { lockedTo: studentData });

        // 3️⃣ Öğrenciyi ayrı koleksiyona kaydet
        await addDoc(collection(db, "students"), studentData);

        // 4️⃣ Panele yönlendir
        navigate("/panel", { state: studentData });
      } else {
        setError("❌ Bu kod zaten kullanılıyor!");
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
          background: "white",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h2>🎓 Öğrenci Girişi</h2>
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
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "dodgerblue",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🚀 Giriş Yap
        </button>
      </form>
    </div>
  );
}
