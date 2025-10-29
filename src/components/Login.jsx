import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Login.css";

export default function Login() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔤 Türkçe karakterleri normalize eden yardımcı fonksiyon
  const normalizeText = (text) => {
    return text
      .trim()
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // aksanları temizle
      .replaceAll("ü", "u")
      .replaceAll("ö", "o")
      .replaceAll("ç", "c")
      .replaceAll("ğ", "g")
      .replaceAll("ı", "i")
      .replaceAll("ş", "s");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Giriş verilerini normalize et
      const kodNorm = code.trim();
      const adNorm = normalizeText(name);
      const soyadNorm = normalizeText(surname);
      const sinifNorm = className.trim().toUpperCase();

      // Firestore'dan tüm öğrencileri çek
      const snap = await getDocs(collection(db, "students"));
      if (snap.empty) {
        setError("⚠️ Öğrenci verisi bulunamadı!");
        return;
      }

      // Her öğrenciyi normalize ederek karşılaştır
      let foundStudent = null;
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const dbKod = (data.kod || "").trim();
        const dbAd = normalizeText(data.ad || "");
        const dbSoyad = normalizeText(data.soyad || "");
        const dbSinif = (data.sinif || "").trim().toUpperCase();

        if (
          dbKod === kodNorm &&
          dbAd === adNorm &&
          dbSoyad === soyadNorm &&
          dbSinif === sinifNorm
        ) {
          foundStudent = data;
        }
      });

      if (!foundStudent) {
        setError("❌ Bilgiler hatalı veya öğrenci bulunamadı!");
        return;
      }

      // ✅ Giriş başarılı
      localStorage.setItem("activeStudent", JSON.stringify(foundStudent));
      navigate("/panel", { state: foundStudent });
    } catch (err) {
      console.error("Login error:", err);
      setError("⚠️ Firestore bağlantısı başarısız!");
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
          placeholder="🏫 Sınıf (örn: 5A)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit">🚀 Giriş Yap</button>
      </form>
    </div>
  );
}
