// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import createPlan from "../utils/createPlan"; // 🔥 sınıf planını kontrol etmek için
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const [savedAccount, setSavedAccount] = useState(null);
  const [isExisting, setIsExisting] = useState(false);

  // ✅ Kayıtlı hesap varsa otomatik doldur
  useEffect(() => {
    const saved = localStorage.getItem("lastStudent");
    if (saved) {
      const s = JSON.parse(saved);
      setCode(s.kod);
      setName(s.ad);
      setSurname(s.soyad);
      setClassName(s.sinif);
      setSavedAccount(s);
      setIsExisting(true);
    }
  }, []);

  // 🔍 Kod girildiğinde Firestore'dan öğrenci bilgilerini çek
  const handleCodeChange = async (val) => {
    setCode(val);
    if (val.trim().length < 2) return;

    try {
      const ref = doc(db, "students", val.trim());
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.ad);
        setSurname(data.soyad);
        setClassName(data.sinif);
        setIsExisting(true);
      } else {
        // Yeni öğrenci olacak
        setName("");
        setSurname("");
        setClassName("");
        setIsExisting(false);
      }
    } catch (err) {
      console.error("Kod kontrol hatası:", err);
    }
  };

  // 🚀 Giriş / Kayıt işlemi
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
      const studentRef = doc(db, "students", kodNorm);
      const snap = await getDoc(studentRef);

      // 🔹 Ortak öğrenci verisi
      const studentData = {
        ad: name.trim(),
        soyad: surname.trim(),
        sinif: sinifNorm,
        kod: kodNorm,
      };

      if (snap.exists()) {
        // 🔹 Kod zaten varsa giriş yap
        const data = snap.data();

        if (
          data.ad.toLowerCase() === name.toLowerCase() &&
          data.soyad.toLowerCase() === surname.toLowerCase() &&
          data.sinif.toLowerCase() === sinifNorm.toLowerCase()
        ) {
          await setDoc(
            studentRef,
            { lastLogin: serverTimestamp() },
            { merge: true }
          );

          // 🔥 PLAN KONTROLÜ
          const planRef = doc(db, "plans", sinifNorm);
          const planSnap = await getDoc(planRef);

          if (!planSnap.exists()) {
            console.log(`📘 ${sinifNorm} planı bulunamadı, oluşturuluyor...`);
            await createPlan(sinifNorm);
          } else {
            console.log(`✅ ${sinifNorm} planı zaten mevcut.`);
          }

          localStorage.setItem("activeStudent", JSON.stringify(studentData));
          localStorage.setItem("lastStudent", JSON.stringify(studentData));
          navigate("/panel", { state: studentData });
        } else {
          setError("⚠️ Bu kod başka bir öğrenciye ait!");
        }
      } else {
        // 🔹 Yeni öğrenci kaydı oluştur
        const newStudent = {
          ad: name.trim(),
          soyad: surname.trim(),
          sinif: sinifNorm,
          kod: kodNorm,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };

        await setDoc(studentRef, newStudent);

        // 🔹 progress belgesi oluştur
        const progressRef = doc(db, "progress", kodNorm);
        await setDoc(progressRef, {
          currentDay: 1,
          currentExercise: 0,
          completed: false,
          streak: 0,
          lastUpdate: serverTimestamp(),
        });

        // 🔥 PLAN KONTROLÜ
        const planRef = doc(db, "plans", sinifNorm);
        const planSnap = await getDoc(planRef);

        if (!planSnap.exists()) {
          console.log(`📘 ${sinifNorm} planı bulunamadı, oluşturuluyor...`);
          await createPlan(sinifNorm);
        } else {
          console.log(`✅ ${sinifNorm} planı zaten mevcut.`);
        }

        localStorage.setItem("activeStudent", JSON.stringify(studentData));
        localStorage.setItem("lastStudent", JSON.stringify(studentData));

        alert("✅ Kayıt oluşturuldu! İlk egzersize yönlendiriliyorsun 🎯");
        navigate("/takistoskop", {
          state: {
            fromExercisePlayer: true,
            studentCode: kodNorm,
            className: sinifNorm,
            duration: 240,
          },
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("⚠️ Firestore bağlantısı başarısız!");
    }
  };

  // 🔄 Hesabı değiştir
  const handleLogout = () => {
    localStorage.removeItem("activeStudent");
    localStorage.removeItem("lastStudent");
    setSavedAccount(null);
    setCode("");
    setName("");
    setSurname("");
    setClassName("");
    setIsExisting(false);
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>🎓 Öğrenci Girişi</h2>

        <input
          type="text"
          placeholder="🔑 Kod"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="😀 Ad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isExisting}
        />

        <input
          type="text"
          placeholder="😊 Soyad"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
          disabled={isExisting}
        />

        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
          disabled={isExisting}
        >
          <option value="">🎒 Sınıf Seçiniz</option>
          {[
            "5A", "5B", "5C", "5D", "5E",
            "6A", "6B", "6C", "6D", "6E",
            "7A", "7B", "7C", "7D", "7E",
            "8A", "8B", "8C", "8D", "8E",
          ].map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        {error && <p className="error-text">{error}</p>}

        <button type="submit">🚀 Giriş Yap</button>

        {savedAccount && (
          <button
            type="button"
            className="switch-btn"
            onClick={handleLogout}
          >
            🔄 Hesabı Değiştir
          </button>
        )}
      </form>
    </div>
  );
}
