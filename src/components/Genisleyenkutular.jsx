import React, { useState, useEffect } from "react";

export default function Genisleyenkutular() {
  const [running, setRunning] = useState(false);
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [size, setSize] = useState(100);
  const [intervalMs, setIntervalMs] = useState(1000);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setSize((prev) => {
          if (prev > 300) {
            // reset olduğunda numaralar değişsin
            setNumbers([
              Math.floor(Math.random() * 9) + 1,
              Math.floor(Math.random() * 9) + 1,
              Math.floor(Math.random() * 9) + 1,
              Math.floor(Math.random() * 9) + 1,
              Math.floor(Math.random() * 9) + 1,
            ]);
            return 100;
          }
          return prev + 20;
        });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [running, intervalMs]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2 style={{ fontSize: "26px", color: "#2c3e50", marginBottom: "20px" }}>
        📦 Genişleyen Kutular Egzersizi
      </h2>

      <div style={{ margin: "10px" }}>
        <label style={{ fontWeight: "bold", marginRight: "8px" }}>Hız (ms): </label>
        <input
          type="number"
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value))}
          style={{
            marginRight: "10px",
            padding: "6px 10px",
            border: "2px solid #3498db",
            borderRadius: "6px",
          }}
        />
        <button
          onClick={() => setRunning(!running)}
          style={{
            padding: "8px 16px",
            background: running
              ? "linear-gradient(45deg, #e74c3c, #c0392b)"
              : "linear-gradient(45deg, #2ecc71, #27ae60)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {running ? "⏸ Durdur" : "▶ Başlat"}
        </button>
      </div>

      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          margin: "50px auto",
          transition: "width 0.2s, height 0.2s",
        }}
      >
        {/* Ortadaki daire */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #74ebd5, #9face6)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            border: "2px solid #34495e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            fontWeight: "bold",
            color: "#2c3e50",
          }}
        >
          {numbers[2]}
        </div>

        {/* Yukarı */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fbc2eb, #a6c1ee)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            border: "2px solid #34495e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "bold",
            color: "#2c3e50",
          }}
        >
          {numbers[0]}
        </div>

        {/* Aşağı */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fad0c4, #ffd1ff)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            border: "2px solid #34495e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "bold",
            color: "#2c3e50",
          }}
        >
          {numbers[1]}
        </div>

        {/* Sol */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ffecd2, #fcb69f)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            border: "2px solid #34495e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "bold",
            color: "#2c3e50",
          }}
        >
          {numbers[3]}
        </div>

        {/* Sağ */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            border: "2px solid #34495e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "bold",
            color: "#2c3e50",
          }}
        >
          {numbers[4]}
        </div>
      </div>
    </div>
  );
}
