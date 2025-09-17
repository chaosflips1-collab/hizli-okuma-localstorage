import React from "react";
import { useNavigate } from "react-router-dom";

export default function Panel({ student }) {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>
        Hoş geldin {student?.name} {student?.surname}
      </h2>
      <p>
        Sınıf: {student?.className} | Kod: {student?.code}
      </p>

      <h3 style={{ marginTop: "30px" }}>Egzersizler</h3>
      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "15px 30px",
            fontSize: "16px",
            margin: "10px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/takistoskop")}
        >
          Egzersiz 1: Takistoskop
        </button>
        <button
          style={{
            padding: "15px 30px",
            fontSize: "16px",
            margin: "10px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/kosesel")}
        >
          Egzersiz 2: Köşesel
        </button>
        <button
          style={{
            padding: "15px 30px",
            fontSize: "16px",
            margin: "10px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/acili")}
        >
          Egzersiz 3: Açılı
        </button>
      </div>
    </div>
  );
}
