import React, { useState, useEffect } from "react";

export default function Odaklanma() {
  const [numbers, setNumbers] = useState([0, 0, 0, 0]);
  const [running, setRunning] = useState(false);

  // Rakamları sürekli değiştirme
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        const newNumbers = Array.from({ length: 4 }, () =>
          Math.floor(Math.random() * 10)
        );
        setNumbers(newNumbers);
      }, 1000); // her 1 saniyede değişsin
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #f9f9f9, #e6f7ff)",
        fontFamily: "'Comic Sans MS', Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "green", marginBottom: "20px" }}>🎯 Odaklanma Çalışması</h2>
      <p style={{ maxWidth: "600px", marginBottom: "30px", fontSize: "16px" }}>
        Ortadaki kırmızı noktaya odaklan. Çevresinde bulunan rakamlar sürekli değişecek.
      </p>

      <div style={{ position: "relative", width: "250px", height: "250px" }}>
        {/* Kırmızı nokta */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "red",
          }}
        ></div>

        {/* Rakam kutuları */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {numbers[0]}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {numbers[1]}
        </div>

        <div
          style={{
            position: "absolute",
            left: "10%",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {numbers[2]}
        </div>

        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {numbers[3]}
        </div>
      </div>

      {/* Başlat / Durdur */}
      <div style={{ marginTop: "30px" }}>
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            ▶ Başlat
          </button>
        ) : (
          <button
            onClick={() => setRunning(false)}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            ⏹ Durdur
          </button>
        )}
      </div>
    </div>
  );
}
