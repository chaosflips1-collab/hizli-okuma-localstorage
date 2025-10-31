// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const [savedAccount, setSavedAccount] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // ✅ kayıtlı hesap varsa otomatik doldur
  useEffect(() => {
    const saved = localStorage.getItem("lastStudent");
    if (saved) {
      const s = JSON.parse(saved);
      setCode(s.kod);
      setName(s.ad);
      setSurname(s.soyad);
      setClassName(s.sinif);
      setSavedAccount(s);
    }
  }, []);

  const normalizeText = (text) =>
    text
      .trim()
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll("ü", "u")
      .replaceAll("ö", "o")
      .replaceAll("ç", "c")
      .replaceAll("ğ", "g")
      .replaceAll("ı", "i")
      .replaceAll("ş", "s");

  // 🔍 Ad kısmına yazıldıkça Firestore'dan öneriler getir
  const handleNameChange = async (val) => {
    setName(val);
    if (val.length < 2) return setSuggestions([]);

    const snap = await getDocs(collection(db, "students"));
    const results = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (normalizeText(data.ad).startsWith(normalizeText(val))) {
        results.push(data);
      }
    });
    setSuggestions(results.slice(0, 5));
  };

  const handleSuggestionClick = (student) => {
    setCode(student.kod);
    setName(student.ad);
    setSurname(student.soyad);
    setClassName(student.sinif);
    setSuggestions([]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!code || !name || !surname || !className) {
        setError("⚠️ Lütfen tüm alanları doldur!");
        return;
      }

      const kodNorm = code.trim();
      const sinifNorm = className.trim().toUpperCase();

      await setDoc(
        doc(db, "students", kodNorm),
        {
          ad: name.trim(),
          soyad: surname.trim(),
          sinif: sinifNorm,
          kod: kodNorm,
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      const studentData = { ad: name.trim(), soyad: surname.trim(), sinif: sinifNorm, kod: kodNorm };
      localStorage.setItem("activeStudent", JSON.stringify(studentData));
      localStorage.setItem("lastStudent", JSON.stringify(studentData));

      navigate("/panel", { state: studentData });
    } catch (err) {
      console.error("Login error:", err);
      setError("⚠️ Firestore bağlantısı başarısız!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("activeStudent");
    localStorage.removeItem("lastStudent");
    setSavedAccount(null);
    setCode("");
    setName("");
    setSurname("");
    setClassName("");
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

        <div className="input-wrapper">
          <input
            type="text"
            placeholder="😀 Ad"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((s) => (
                <li key={s.kod} onClick={() => handleSuggestionClick(s)}>
                  {s.ad} {s.soyad} ({s.sinif})
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="text"
          placeholder="😊 Soyad"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />

        <select value={className} onChange={(e) => setClassName(e.target.value)} required>
          <option value="">🎒 Sınıf Seçiniz</option>
          {["5A","5B","5C","5D","5E","6A","6B","6C","6D","6E","7A","7B","7C","7D","7E","8A","8B","8C","8D","8E"].map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        {error && <p className="error-text">{error}</p>}

        <button type="submit">🚀 Giriş Yap</button>

        {savedAccount && (
          <button type="button" className="switch-btn" onClick={handleLogout}>
            🔄 Hesabı Değiştir
          </button>
        )}
      </form>
    </div>
  );
}
