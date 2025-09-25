// src/components/Kategori.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Panel.css";

export default function Kategori() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const categoryTitles = {
    goz: "👁️ Göz Algılama Çalışmaları",
    dikkat: "🎯 Dikkat ve Konsantrasyon Çalışmaları",
    kas: "💪 Göz Kaslarını Geliştirme Çalışmaları",
    hizli: "📚 Hızlı Okuma ve Okuduğunu Anlama Çalışması",
  };

  const filteredExercises = exercises.filter((ex) => ex.category === id);

  return (
    <div className="panel-container">
      <h2>{categoryTitles[id]}</h2>
      <button className="logout-btn" onClick={() => navigate("/panel")}>⬅ Panele Dön</button>

      <div className="exercise-grid">
        {filteredExercises.map((ex) => (
          <div key={ex.id} className="exercise-card" onClick={() => navigate(ex.path)}>
            <div className="exercise-icon">{ex.icon}</div>
            <div className="exercise-info">
              <h3>{ex.name}</h3>
              <p>{ex.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
