import React, { useState, useEffect } from "react";

export default function Buyuyensekil() {
  const [running, setRunning] = useState(false);
  const [letters, setLetters] = useState(["a", "b", "c", "d"]);
  const [size, setSize] = useState(100);
  const [intervalMs, setIntervalMs] = useState(1000);

  // 🔤 Rastgele harf üretici
  const randomLetter = () => {
    const alphabet = "abcçdefgğhıijklmnoöprsştuüvyz";
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  };

  // 🔄 Her adımda harf değişsin
  const newLetters = () => [
    randomLetter(),
    randomLetter(),
    randomLetter(),
    randomLetter(),
  ];

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setSize((prev) => {
          if (prev > 300) {
            setLetters(newLetters());
            return 100;
          } else {
            setLetters(newLetters());
            return prev + 20;
          }
        });
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [running, intervalMs]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>📏 Büyüyen Şekil Egzersizi</h2>

      <div style={{ margin: "10px" }}>
        <label>Hız (ms): </label>
        <input
          type="number"
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value))}
          style={{ marginRight: "10px" }}
        />
        <button onClick={() => setRunning(!running)}>
          {running ? "Durdur" : "Başlat"}
        </button>
      </div>

      {/* Şekil */}
      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size / 2}px`,
          margin: "50px auto",
          background: "peru",
          borderRadius: "20px",
        }}
      >
        {/* Ortadaki kırmızı nokta */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "8px",
            height: "8px",
            background: "red",
            borderRadius: "50%",
          }}
        ></div>

        {/* Harfler - büyütüldü */}
        <div
          style={{
            position: "absolute",
            top: "-30px",
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: "bold",
            fontSize: "28px",
          }}
        >
          {letters[0]}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: "bold",
            fontSize: "28px",
          }}
        >
          {letters[1]}
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-30px",
            transform: "translateY(-50%)",
            fontWeight: "bold",
            fontSize: "28px",
          }}
        >
          {letters[2]}
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-30px",
            transform: "translateY(-50%)",
            fontWeight: "bold",
            fontSize: "28px",
          }}
        >
          {letters[3]}
        </div>
      </div>
    </div>
  );
}
