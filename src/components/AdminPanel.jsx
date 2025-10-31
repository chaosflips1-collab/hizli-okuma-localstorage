// src/components/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [students, setStudents] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [lastLogin, setLastLogin] = useState(null);
  const [firestorePassword, setFirestorePassword] = useState(null);
  const [form, setForm] = useState({ kod: "", ad: "", soyad: "", sinif: "" });
  const navigate = useNavigate();

  // 🔹 Firestore'dan admin bilgilerini çek
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const adminRef = doc(db, "admins", "mainAdmin");
        const snap = await getDoc(adminRef);
        if (snap.exists()) {
          const data = snap.data();
          setFirestorePassword(data.password);

          let formattedDate = null;
          if (data.lastLogin) {
            if (typeof data.lastLogin === "string") {
              formattedDate = data.lastLogin;
            } else if (data.lastLogin.toDate) {
              const date = data.lastLogin.toDate();
              formattedDate = date
                .toLocaleString("tr-TR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
                .replace(",", "");
            }
          }
          setLastLogin(formattedDate);
        }
      } catch (err) {
        console.error("Admin bilgisi alınamadı:", err);
      }
    };

    fetchAdminData();
  }, []);

  // 🔐 Admin girişi
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password === firestorePassword) {
      const now = new Date();
      const formatted = now.toLocaleString("tr-TR");

      try {
        await setDoc(
          doc(db, "admins", "mainAdmin"),
          {
            username: "admin",
            password: firestorePassword,
            lastLogin: formatted,
          },
          { merge: true }
        );

        setAuthorized(true);
        setLastLogin(formatted);
        localStorage.setItem("adminAuth", "true");
      } catch (err) {
        console.error("Admin login güncellenemedi:", err);
      }
    } else {
      alert("❌ Yanlış şifre!");
    }
  };

  // 🚪 Çıkış yap
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setAuthorized(false);
    navigate("/admin", { replace: true });
  };

  // 🔄 Öğrenci verilerini Firestore'dan çek
  useEffect(() => {
    if (!authorized) return;
    const fetchStudents = async () => {
      try {
        const snap = await getDocs(collection(db, "students"));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(list);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [authorized]);

  // 🔄 Öğrenci ilerlemelerini çek
  useEffect(() => {
    if (!authorized) return;
    const fetchProgress = async () => {
      try {
        const snap = await getDocs(collection(db, "progress"));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProgressData(list);
      } catch (err) {
        console.error("İlerleme verisi alınamadı:", err);
      }
    };
    fetchProgress();
  }, [authorized]);

  // ✅ Yeni öğrenci ekle
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "students"), form);
      setForm({ kod: "", ad: "", soyad: "", sinif: "" });
      alert("✅ Öğrenci başarıyla eklendi!");
      window.location.reload();
    } catch (err) {
      console.error("Ekleme hatası:", err);
      alert("⚠️ Firestore’a ekleme yapılamadı!");
    }
  };

  // ❌ Öğrenci sil
  const handleDelete = async (id) => {
    if (!window.confirm("Bu öğrenciyi silmek istediğine emin misin?")) return;
    try {
      await deleteDoc(doc(db, "students", id));
      setStudents(students.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  if (!authorized) {
    return (
      <div className="admin-login-screen">
        <form className="admin-login-card" onSubmit={handlePasswordSubmit}>
          <h2>🔒 Admin Girişi</h2>
          <p className="login-subtext">Yönetici erişimi için şifrenizi girin</p>

          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">🚀 Giriş Yap</button>

          {lastLogin && (
            <p className="last-login">
              🕒 Son Giriş: <b>{lastLogin}</b>
            </p>
          )}
        </form>
      </div>
    );
  }

  // 🎓 Admin paneli
  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <div className="header-right">
          {lastLogin && <p>🕒 Son Giriş: {lastLogin}</p>}
          <button onClick={handleLogout} className="logout-btn">
            🚪 Çıkış Yap
          </button>
        </div>
      </div>

      {/* 🧩 Yeni öğrenci ekleme */}
      <section className="admin-section">
        <h2>➕ Yeni Öğrenci Ekle</h2>
        <form className="admin-actions" onSubmit={handleAdd}>
          <input type="text" placeholder="Kod" value={form.kod} onChange={(e) => setForm({ ...form, kod: e.target.value })} required />
          <input type="text" placeholder="Ad" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required />
          <input type="text" placeholder="Soyad" value={form.soyad} onChange={(e) => setForm({ ...form, soyad: e.target.value })} required />
          <input type="text" placeholder="Sınıf" value={form.sinif} onChange={(e) => setForm({ ...form, sinif: e.target.value })} required />
          <button type="submit">💾 Kaydet</button>
        </form>
      </section>

      {/* 🧠 Öğrenci İlerleme Takibi */}
      <section className="admin-section">
        <h2>📊 Öğrenci İlerleme Takibi</h2>
        {progressData.length === 0 ? (
          <p>⏳ Henüz ilerleme kaydı yok</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>Sınıf</th>
                <th>Gün</th>
                <th>Egzersiz</th>
                <th>Durum</th>
                <th>Son Güncelleme</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((p) => {
                const studentInfo = students.find((s) => s.kod === p.id);
                return (
                  <tr key={p.id}>
                    <td>{studentInfo ? `${studentInfo.ad} ${studentInfo.soyad}` : "—"}</td>
                    <td>{studentInfo ? studentInfo.sinif : "—"}</td>
                    <td>{p.currentDay || 0}</td>
                    <td>{p.currentExercise !== undefined ? p.currentExercise + 1 : "—"}</td>
                    <td>{p.completed ? "✅ Tamamlandı" : "🕓 Devam Ediyor"}</td>
                    <td>{p.lastUpdate ? new Date(p.lastUpdate.seconds * 1000).toLocaleString("tr-TR") : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* 📋 Öğrenci Listesi */}
      <section className="admin-section">
        <div className="section-header">
          <h2>📋 Öğrenci Listesi</h2>
        </div>
        {loading ? (
          <p>⏳ Yükleniyor...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Kod</th>
                <th>Ad Soyad</th>
                <th>Sınıf</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.kod}</td>
                  <td>{s.ad} {s.soyad}</td>
                  <td>{s.sinif}</td>
                  <td><button className="delete-btn" onClick={() => handleDelete(s.id)}>❌</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
