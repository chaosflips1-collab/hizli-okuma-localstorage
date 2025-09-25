// src/components/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [codes, setCodes] = useState([]);
  const [startCode, setStartCode] = useState("");
  const [prefix, setPrefix] = useState("");
  const [lastNumber, setLastNumber] = useState(null);

  // 🔄 LocalStorage'dan mevcut kodları çek
  useEffect(() => {
    const savedCodes = JSON.parse(localStorage.getItem("codes")) || [];
    setCodes(savedCodes);
  }, []);

  // ✅ Kod Üret → LocalStorage’a kaydet
  const handleGenerateCodes = () => {
    let localPrefix = prefix;
    let numberPart = lastNumber;

    if (!codes.length) {
      if (!startCode) return;

      localPrefix = startCode.match(/[^\d]+/)[0];
      numberPart = parseInt(startCode.match(/\d+/)[0]);

      setPrefix(localPrefix);
      setLastNumber(numberPart - 1);
    }

    const newCodes = [];
    for (let i = 1; i <= 20; i++) {
      const num = (numberPart ?? lastNumber) + i;
      const formatted = String(num).padStart(4, "0");
      const codeId = `${localPrefix}${formatted}`;

      newCodes.push({
        id: codeId,
        code: codeId,
        lockedTo: null,
      });
    }

    const updatedCodes = [...codes, ...newCodes];
    setCodes(updatedCodes);
    localStorage.setItem("codes", JSON.stringify(updatedCodes));

    setLastNumber((numberPart ?? lastNumber) + 20);
    setStartCode("");
  };

  // ❌ Kod sil
  const handleDeleteCode = (id) => {
    const updatedCodes = codes.filter((c) => c.id !== id);
    setCodes(updatedCodes);
    localStorage.setItem("codes", JSON.stringify(updatedCodes));
  };

  return (
    <div className="admin-panel-container">
      <h1>⚙️ Admin Panel</h1>

      {/* Kod Üretme */}
      <section className="admin-section">
        <h2>🔑 Kod Üret</h2>
        <div className="admin-actions">
          {!codes.length && (
            <input
              type="text"
              placeholder="örn: öğr0001"
              value={startCode}
              onChange={(e) => setStartCode(e.target.value)}
            />
          )}
          <button onClick={handleGenerateCodes}>➕ 20 Kod Üret</button>
        </div>
        {lastNumber && (
          <p className="info-text">
            📌 En son üretilen kod:{" "}
            <b>
              {prefix}
              {String(lastNumber).padStart(4, "0")}
            </b>
          </p>
        )}
      </section>

      {/* Kod Listesi */}
      <section className="admin-section">
        <h2>📋 Kod Listesi</h2>
        <table>
          <thead>
            <tr>
              <th>Kod</th>
              <th>Kullanan Öğrenci</th>
              <th>Sil</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>
                  {c.lockedTo
                    ? `${c.lockedTo.name} ${c.lockedTo.surname} (${c.lockedTo.className})`
                    : "—"}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteCode(c.id)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
