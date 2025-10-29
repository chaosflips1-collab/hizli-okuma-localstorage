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
      const formatted = now
        .toLocaleString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .replace(",", "");

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
    navigate("/admin", { replace: true }); // ✅ Artık doğru route
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

  // 🚫 Eğer yetkili değilse şifre ekranı çıkar
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

      <section className="admin-section">
        <h2>➕ Yeni Öğrenci Ekle</h2>
        <form className="admin-actions" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Kod"
            value={form.kod}
            onChange={(e) => setForm({ ...form, kod: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Ad"
            value={form.ad}
            onChange={(e) => setForm({ ...form, ad: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Soyad"
            value={form.soyad}
            onChange={(e) => setForm({ ...form, soyad: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Sınıf"
            value={form.sinif}
            onChange={(e) => setForm({ ...form, sinif: e.target.value })}
            required
          />
          <button type="submit">💾 Kaydet</button>
        </form>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>📋 Öğrenci Listesi</h2>
          <button
            className="export-btn"
            onClick={() => {
              if (students.length === 0)
                return alert("⚠️ Dışa aktarılacak veri yok!");
              const header = ["Kod", "Ad", "Soyad", "Sınıf"];
              const rows = students.map((s) => [s.kod, s.ad, s.soyad, s.sinif]);
              const csv =
                "data:text/csv;charset=utf-8," +
                [header, ...rows].map((r) => r.join(",")).join("\n");
              const link = document.createElement("a");
              link.href = encodeURI(csv);
              link.download = `ogrenciler_${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;
              document.body.appendChild(link);
              link.click();
            }}
          >
            📤 CSV İndir
          </button>
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
                  <td>
                    {s.ad} {s.soyad}
                  </td>
                  <td>{s.sinif}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(s.id)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
