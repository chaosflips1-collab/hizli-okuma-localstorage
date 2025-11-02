import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ kod: "", ad: "", soyad: "", sinif: "" });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    ongoing: 0,
    averageProgress: 0,
  });

  // 🔹 Bugünün tarihi
  const today = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // 🔁 Firestore verilerini çek (yenileme için ayrı fonksiyon)
  const fetchAll = async () => {
    setLoading(true);
    try {
      const studentsSnap = await getDocs(collection(db, "students"));
      const studentsList = studentsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setStudents(studentsList);

      const progressSnap = await getDocs(collection(db, "progress"));
      const progressList = progressSnap.docs.map((d) => d.data());
      setProgress(progressList);

      // 🔹 İstatistik hesapla
      const total = studentsList.length;
      const ongoing = progressList.filter((p) => p.status === "Devam Ediyor").length;
      const active = progressList.filter((p) => p.day > 0).length;
      const avg =
        progressList.length > 0
          ? (
              progressList.reduce((acc, p) => acc + (p.day || 0), 0) /
              progressList.length
            ).toFixed(1)
          : 0;

      setStats({
        total,
        active,
        ongoing,
        averageProgress: avg,
      });
    } catch (err) {
      console.error("🔥 Firestore veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ➕ Yeni öğrenci ekleme
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.kod || !form.ad || !form.soyad || !form.sinif)
      return alert("⚠️ Lütfen tüm alanları doldurun!");
    try {
      await addDoc(collection(db, "students"), form);
      setForm({ kod: "", ad: "", soyad: "", sinif: "" });
      alert("✅ Öğrenci başarıyla eklendi!");
      fetchAll();
    } catch (err) {
      console.error("Ekleme hatası:", err);
    }
  };

  // ❌ Öğrenci silme
  const handleDelete = async (id) => {
    if (!window.confirm("Bu öğrenciyi silmek istediğine emin misin?")) return;
    try {
      await deleteDoc(doc(db, "students", id));
      setStudents(students.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h1>📊 İstatistik Özeti — {today}</h1>
        <button onClick={fetchAll} className="refresh-btn">
          🔄 Yenile
        </button>
      </div>

      {/* 📊 İstatistik kutuları */}
      <div className="stat-cards">
        <div className="stat-card total">
          <h3>👥 Toplam Öğrenci</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card active">
          <h3>🔥 Aktif Öğrenciler</h3>
          <p>{stats.active}</p>
        </div>
        <div className="stat-card ongoing">
          <h3>📚 Devam Edenler</h3>
          <p>{stats.ongoing}</p>
        </div>
        <div className="stat-card avg">
          <h3>📈 Ortalama Gün</h3>
          <p>{stats.averageProgress}</p>
        </div>
      </div>

      {/* 🧩 Yeni öğrenci ekleme */}
      <div className="admin-section">
        <h2>➕ Yeni Öğrenci Ekle</h2>
        <form onSubmit={handleAdd} className="admin-actions">
          <input
            type="text"
            placeholder="Kod"
            value={form.kod}
            onChange={(e) => setForm({ ...form, kod: e.target.value })}
          />
          <input
            type="text"
            placeholder="Ad"
            value={form.ad}
            onChange={(e) => setForm({ ...form, ad: e.target.value })}
          />
          <input
            type="text"
            placeholder="Soyad"
            value={form.soyad}
            onChange={(e) => setForm({ ...form, soyad: e.target.value })}
          />
          <input
            type="text"
            placeholder="Sınıf"
            value={form.sinif}
            onChange={(e) => setForm({ ...form, sinif: e.target.value })}
          />
          <button type="submit">💾 Kaydet</button>
        </form>
      </div>

      {/* 📘 Öğrenci ilerleme tablosu */}
      <div className="admin-section">
        <h2>📘 Öğrenci İlerleme Takibi</h2>
        {loading ? (
          <p>⏳ Veriler yükleniyor...</p>
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
              {progress.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.class}</td>
                  <td>{p.day || "-"}</td>
                  <td>{p.exercise || "-"}</td>
                  <td>{p.status}</td>
                  <td>{p.updatedAt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 📄 Öğrenci listesi */}
      <div className="admin-section">
        <h2>📄 Öğrenci Listesi</h2>
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
                  <button className="delete-btn" onClick={() => handleDelete(s.id)}>
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
