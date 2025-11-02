import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function AddStudent() {
  const [kod, setKod] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [sinif, setSinif] = useState("");
  const [status, setStatus] = useState("");

  const handleAdd = async () => {
    if (!kod || !ad || !soyad || !sinif) {
      alert("Tüm alanları doldur kanka!");
      return;
    }

    try {
      await setDoc(doc(db, "students", kod), {
        kod,
        ad,
        soyad,
        sinif,
      });

      setStatus(`✅ ${ad} ${soyad} Firestore’a eklendi!`);
      setKod("");
      setAd("");
      setSoyad("");
      setSinif("");
    } catch (err) {
      console.error("🔥 Firestore hata:", err);
      setStatus("❌ Hata: " + err.message);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>🧑‍🎓 Öğrenci Ekleme Aracı</h2>
      <input
        placeholder="Kod (örnek: 1234)"
        value={kod}
        onChange={(e) => setKod(e.target.value)}
        style={{ margin: "5px" }}
      />
      <input
        placeholder="Ad"
        value={ad}
        onChange={(e) => setAd(e.target.value)}
        style={{ margin: "5px" }}
      />
      <input
        placeholder="Soyad"
        value={soyad}
        onChange={(e) => setSoyad(e.target.value)}
        style={{ margin: "5px" }}
      />
      <input
        placeholder="Sınıf (örnek: 5A)"
        value={sinif}
        onChange={(e) => setSinif(e.target.value)}
        style={{ margin: "5px" }}
      />
      <br />
      <button
        onClick={handleAdd}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Ekle
      </button>
      <p>{status}</p>
    </div>
  );
}
