import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Panel.css";

export default function Panel() {
  const navigate = useNavigate();
  const location = useLocation();
  const studentFromLogin = location.state;

  const [student, setStudent] = useState(studentFromLogin || null);

  // Firestore'dan güncel öğrenci verilerini çek
  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentFromLogin) return;

      const ref = doc(db, "students", studentFromLogin.code);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setStudent(snap.data());
      }
    };

    fetchStudent();
  }, [studentFromLogin]);

  if (!student) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        ⏳ Yükleniyor...
      </p>
    );
  }

  // Egzersiz listesi
  const exercises = [
    {
      id: 1,
      name: "Takistoskop",
      icon: "🔤",
      desc: "Kelimeleri hızlıca görüp tanıma çalışması",
      path: "/takistoskop",
    },
    {
      id: 2,
      name: "Köşesel",
      icon: "👀",
      desc: "Aynı anda farklı köşelere odaklanma çalışması",
      path: "/kosesel",
    },
    {
      id: 3,
      name: "Açılı",
      icon: "📖",
      desc: "Gözün farklı açılarda kelimeleri yakalaması",
      path: "/acili",
    },
    {
      id: 4,
      name: "Çift Taraflı Odak",
      icon: "🔁",
      desc: "Yan yana çıkan kelimeleri takip et, aynıysa tıkla!",
      path: "/cifttarafliodak",
    },
    {
      id: 5,
      name: "Harf Bulma Odak",
      icon: "🔎",
      desc: "Belirtilen harf/rakamı say ve cevapla!",
      path: "/harfbulmaodakcalismasi",
    },
    {
      id: 6,
      name: "Odaklanma",
      icon: "🎯",
      desc: "Ortadaki noktaya odaklan, rakamlar değişsin!",
      path: "/odaklanma",
    },
    {
      id: 7,
      name: "Hafıza Geliştirme",
      icon: "🧠",
      desc: "Kutuları hatırlayın ve doğru olanlara tıklayın. Hafızanızı güçlendirin.",
      path: "/hafizagelistirmecalismasi",
    },
    {
      id: 8,
      name: "Göz Oyunu",
      icon: "👁️",
      desc: "Emoji dört yönde hareket eder, takip et!",
      path: "/gozoyunu",
    },
    {
      id: 9,
      name: "Büyüyen Şekil",
      icon: "📏",
      desc: "Şekil büyüdükçe kenardaki harfleri yakala!",
      path: "/buyuyensekil",
    },
    {
      id: 10,
      name: "Genişleyen Kutular",
      icon: "🟥",
      desc: "Kutular büyüyerek ayrılır, rakamları takip et!",
      path: "/genisleyenkutular",
    },
    {
      id: 11,
      name: "Egzersiz 11",
      icon: "🎵",
      desc: "Hazırlanıyor...",
      path: "/egzersiz11",
    },
    {
      id: 12,
      name: "Egzersiz 12",
      icon: "📝",
      desc: "Hazırlanıyor...",
      path: "/egzersiz12",
    },
    {
      id: 13,
      name: "Egzersiz 13",
      icon: "🎲",
      desc: "Hazırlanıyor...",
      path: "/egzersiz13",
    },
    {
      id: 14,
      name: "Egzersiz 14",
      icon: "🔥",
      desc: "Hazırlanıyor...",
      path: "/egzersiz14",
    },
  ];

  // 📌 Kategoriler
  const categories = [
    {
      title: "👁️ Göz Algılama Çalışmaları",
      items: [exercises[0], exercises[1], exercises[2]], // Takistoskop, Köşesel, Açılı
    },
    {
      title: "🎯 Dikkat ve Konsantrasyon Çalışmaları",
      items: [exercises[3], exercises[4], exercises[5], exercises[6]], // Çift Taraflı Odak, Harf Bulma, Odaklanma, Hafıza Geliştirme
    },
    {
      title: "💪 Göz Kaslarını Geliştirme Çalışmaları",
      items: [exercises[7], exercises[8], exercises[9]], // Göz Oyunu, Büyüyen Şekil, Genişleyen Kutular
    },
  ];

  return (
    <div className="panel-container">
      <h1>
        🎉 Hoş geldin {student.name} {student.surname}!
      </h1>

      {/* Öğrenci Kartı */}
      <div className="student-card">
        <p>👤 {student.name} {student.surname}</p>
        <p>📚 {student.className}</p>
        <p>🆔 {student.code}</p>
      </div>

      {/* Egzersizler */}
      <h2 className="exercise-title">🚀 Egzersizler</h2>

      {categories.map((cat, idx) => (
        <div key={idx}>
          <h3 className="exercise-title">{cat.title}</h3>
          <div className="exercise-grid">
            {cat.items.map((ex) => (
              <div
                key={ex.id}
                className="exercise-card"
                onClick={() => navigate(ex.path)}
              >
                <div className="exercise-icon">{ex.icon}</div>
                <div className="exercise-info">
                  <h3>{ex.id}. {ex.name}</h3>
                  <p>{ex.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
