// src/components/Panel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Panel.css";

export default function Panel() {
  const navigate = useNavigate();
  const location = useLocation();
  const studentFromLogin = location.state;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null); // ✅ açılan kategori

  useEffect(() => {
    let savedStudent = null;

    if (studentFromLogin) {
      savedStudent = studentFromLogin;
      localStorage.setItem("activeStudent", JSON.stringify(savedStudent));
    } else {
      const localStudent = localStorage.getItem("activeStudent");
      if (localStudent) savedStudent = JSON.parse(localStudent);
    }

    if (savedStudent) {
      setStudent(savedStudent);
    } else {
      navigate("/");
    }

    setLoading(false);
  }, [studentFromLogin, navigate]);

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>⏳ Yükleniyor...</p>;
  if (!student) return null;

  const handleLogout = () => {
    localStorage.removeItem("activeStudent");
    navigate("/");
  };

  // ✅ Tüm egzersizler
  const exercises = [
    { id: 1, name: "Takistoskop", icon: "🔤", desc: "Kelimeleri hızlıca görüp tanıma çalışması", path: "/takistoskop", category: "goz" },
    { id: 2, name: "Köşesel", icon: "👀", desc: "Aynı anda farklı köşelere odaklanma çalışması", path: "/kosesel", category: "goz" },
    { id: 3, name: "Açılı", icon: "📖", desc: "Gözün farklı açılarda kelimeleri yakalaması", path: "/acili", category: "goz" },

    { id: 4, name: "Çift Taraflı Odak", icon: "🔁", desc: "Yan yana çıkan kelimeleri takip et, aynıysa tıkla!", path: "/cifttarafliodak", category: "dikkat" },
    { id: 5, name: "Harf Bulma Odak", icon: "🔎", desc: "Belirtilen harf/rakamı say ve cevapla!", path: "/harfbulmaodakcalismasi", category: "dikkat" },
    { id: 6, name: "Odaklanma", icon: "🎯", desc: "Ortadaki noktaya odaklan, rakamlar değişsin!", path: "/odaklanma", category: "dikkat" },
    { id: 7, name: "Hafıza Geliştirme", icon: "🧠", desc: "Kutuları hatırla ve doğru olanlara tıkla!", path: "/hafizagelistirmecalismasi", category: "dikkat" },

    { id: 8, name: "Göz Oyunu", icon: "👁️", desc: "Emoji dört yönde hareket eder, takip et!", path: "/gozoyunu", category: "kas" },
    { id: 9, name: "Büyüyen Şekil", icon: "📏", desc: "Şekil büyüdükçe kenardaki harfleri yakala!", path: "/buyuyensekil", category: "kas" },
    { id: 10, name: "Genişleyen Kutular", icon: "🟥", desc: "Kutular büyüyerek ayrılır, rakamları takip et!", path: "/genisleyenkutular", category: "kas" },

    { id: 11, name: "Blok Okuma", icon: "📖", desc: "Kelimeleri bloklar halinde hızlıca görme çalışması", path: "/blokokuma", category: "hizli" },
    { id: 12, name: "Hızlı Okuma", icon: "📚", desc: "Kütüphaneden hikaye seçilir, düz / bloklu / belirgin okuma yapılır.", path: "/hizliokuma", category: "hizli" },
  ];

  // ✅ Kategoriler
  const categories = [
    { id: "goz", title: "👁️ Göz Algılama Çalışmaları" },
    { id: "dikkat", title: "🎯 Dikkat ve Konsantrasyon Çalışmaları" },
    { id: "kas", title: "💪 Göz Kaslarını Geliştirme Çalışmaları" },
    { id: "hizli", title: "📚 Hızlı Okuma ve Okuduğunu Anlama Çalışması" },
  ];

  return (
    <div className="panel-container">
      <h1>🎉 Hoş geldin {student.name} {student.surname}!</h1>

      <div className="student-card">
        <p>👤 {student.name} {student.surname}</p>
        <p>📚 {student.className}</p>
        <p>🆔 {student.code}</p>
      </div>

      <button className="logout-btn" onClick={handleLogout}>🚪 Çıkış Yap</button>

      <h2 className="exercise-title">🚀 Çalışma Konuları</h2>

      {/* ✅ Accordion Kategoriler */}
      {categories.map((cat) => (
        <div key={cat.id} className="accordion">
          <div
            className="accordion-header"
            onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
          >
            <h3>{cat.title}</h3>
            <span>{openCategory === cat.id ? "▲" : "▼"}</span>
          </div>

          {openCategory === cat.id && (
            <div className="exercise-grid">
              {exercises.filter((ex) => ex.category === cat.id).map((ex) => (
                <div key={ex.id} className="exercise-card" onClick={() => navigate(ex.path)}>
                  <div className="exercise-icon">{ex.icon}</div>
                  <div className="exercise-info">
                    <h3>{ex.name}</h3>
                    <p>{ex.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
