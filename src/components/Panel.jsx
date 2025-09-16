// src/components/Panel.jsx
import React from "react";
import { useLocation } from "react-router-dom";

export default function Panel() {
  const location = useLocation();
  const { name, surname, className, code } = location.state || {};

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Hoş geldin {name} {surname}</h2>
      <p>Sınıf: {className} | Kod: {code}</p>

      <h3>Burada üniteler ve egzersizler olacak.</h3>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
        <button style={{ padding: "20px", backgroundColor: "green", color: "white", borderRadius: "8px" }}>
          1. Ünite
        </button>
        <button style={{ padding: "20px", backgroundColor: "gray", color: "white", borderRadius: "8px" }}>
          2. Ünite
        </button>
        <button style={{ padding: "20px", backgroundColor: "gray", color: "white", borderRadius: "8px" }}>
          3. Ünite
        </button>
      </div>
    </div>
  );
}
