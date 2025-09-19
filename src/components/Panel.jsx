import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Panel() {
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state || {};

  return (
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #a8edea, #fed6e3)",
        fontFamily: "'Comic Sans MS', Arial, sans-serif",
        padding: "30px",
      }}
    >
      <h1 style={{ color: "#333", marginBottom: "10px" }}>
        🎉 Hoş geldin {student?.name} {student?.surname}!
      </h1>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "15px",
          padding: "20px",
          maxWidth: "300px",
          margin: "0 auto",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <p style={{ fontSize: "18px", margin: "5px" }}>
          👤 Ad Soyad: <b>{student?.name} {student?.surname || "-"}</b>
        </p>
        <p style={{ fontSize: "18px", margin: "5px" }}>
          📚 Sınıf: <b>{student?.className || "-"}</b>
        </p>
        <p style={{ fontSize: "18px", margin: "5px" }}>
          🆔 Kod: <b>{student?.code || "-"}</b>
        </p>
      </div>

      <h2 style={{ marginTop: "40px", marginBottom: "20px", color: "#444" }}>
        🚀 Egzersizler
      </h2>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        <button
          style={{
            padding: "20px 30px",
            fontSize: "18px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#4facfe",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
          }}
          onClick={() => navigate("/takistoskop")}
        >
          🔤 Egzersiz 1 <br /> Takistoskop
        </button>

        <button
          style={{
            padding: "20px 30px",
            fontSize: "18px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#43e97b",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
          }}
          onClick={() => navigate("/kosesel")}
        >
          👀 Egzersiz 2 <br /> Köşesel
        </button>

        <button
          style={{
            padding: "20px 30px",
            fontSize: "18px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#ff6a88",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
          }}
          onClick={() => navigate("/acili")}
        >
          📖 Egzersiz 3 <br /> Açılı
        </button>
      </div>
    </div>
  );
}
