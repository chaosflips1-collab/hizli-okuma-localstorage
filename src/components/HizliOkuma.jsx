// src/components/HizliOkuma.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ çıkış için
import "./HizliOkuma.css";
import stories from "../data/stories";

export default function HizliOkuma() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedStory, setSelectedStory] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [blockIndex, setBlockIndex] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [progress, setProgress] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);

  const totalWords = selectedStory ? selectedStory.content.split(" ").length : 0;

  // Süreli Timer
  useEffect(() => {
    let interval;
    if (running && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setRunning(false);
    }
    return () => clearInterval(interval);
  }, [running, timeLeft]);

  // Otomatik geçiş (Bloklu, Belirgin, Gölgeli)
  useEffect(() => {
    let interval;
    if (running && (step === 3 || step === 4 || step === 5)) {
      interval = setInterval(() => {
        setBlockIndex((prev) => {
          const next = prev + 1;
          setWordsRead((r) => r + 1);

          if ((next + 1) % 15 === 0) {
            setProgress((p) => Math.min(p + 1, 100));
          }

          if (progress >= 100 || next >= totalWords) {
            clearInterval(interval);
            setRunning(false);
            return prev;
          }
          return next;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [running, step, speed, progress, totalWords, selectedStory?.id]);

  const reset = () => {
    setStep(1);
    setSelectedStory(null);
    setTimeLeft(60);
    setRunning(false);
    setBlockIndex(0);
    setProgress(0);
    setWordsRead(0);
  };

  const exitExercise = () => {
    setRunning(false);
    navigate("/panel");
  };

  const getBlocks = (text, blockSize = 10) => {
    const words = text.split(" ");
    const blocks = [];
    for (let i = 0; i < words.length; i += blockSize) {
      blocks.push(words.slice(i, i + blockSize).join(" "));
    }
    return blocks;
  };

  return (
    <div className="hizliokuma-container">
      <h2>⚡ Hızlı Okuma Çalışması</h2>

      {/* 📚 Hikaye Seçim */}
      {step === 1 && (
        <div className="library">
          <h3>📚 Kütüphaneden Hikaye Seç</h3>
          <div className="story-list">
            {stories.map((story) => (
              <div
                key={story.id}
                className="story-card"
                onClick={() => {
                  setSelectedStory(story);
                  setStep(2);
                }}
              >
                <h4>{story.title}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menü butonları */}
      {selectedStory && (
        <div className="menu-buttons">
          <button onClick={() => { setStep(2); setTimeLeft(60); setBlockIndex(0); }}>⏳ Süreli</button>
          <button onClick={() => { setStep(3); setTimeLeft(60); setBlockIndex(0); }}>🟦 Bloklu</button>
          <button onClick={() => { setStep(4); setTimeLeft(60); setBlockIndex(0); }}>✨ Belirgin</button>
          <button onClick={() => { setStep(5); setTimeLeft(60); setBlockIndex(0); }}>🌑 Gölgeli</button>
          <button onClick={reset} className="reset-btn">🔙 Başlangıca Dön</button>
          <button onClick={exitExercise} className="exit-btn">❌ Çıkış</button>
        </div>
      )}

      {/* Hız kontrolü */}
      {selectedStory && step !== 2 && (
        <div style={{ margin: "15px 0" }}>
          <label>⏱️ Hız Ayarı: {(speed / 1000).toFixed(1)} sn </label>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>
      )}

      {/* Süreli */}
      {step === 2 && selectedStory && (
        <div className="reading">
          <h3>⏳ Süreli Okuma</h3>
          <p className="timer">Kalan Süre: {timeLeft} sn</p>
          <div className="story-content">{selectedStory.content}</div>
          {!running ? (
            <button onClick={() => setRunning(true)}>Başlat</button>
          ) : (
            <button onClick={() => setRunning(false)}>Durdur</button>
          )}
        </div>
      )}

      {/* Bloklu */}
      {step === 3 && selectedStory && (
        <div className="reading">
          <h3>🟦 Bloklu Okuma</h3>
          <p className="timer">Kalan Süre: {timeLeft} sn</p>
          <div className="story-content">
            {getBlocks(selectedStory.content, 10)[blockIndex]}
          </div>
          {!running ? (
            <button onClick={() => setRunning(true)}>Başlat</button>
          ) : (
            <button onClick={() => setRunning(false)}>Durdur</button>
          )}
        </div>
      )}

      {/* Belirgin */}
      {step === 4 && selectedStory && (
        <div className="reading">
          <h3>✨ Belirgin Okuma</h3>
          <p className="timer">Kalan Süre: {timeLeft} sn</p>
          <div className="story-content">
            {selectedStory.content.split(" ").map((word, idx) => (
              <span
                key={idx}
                style={{
                  opacity: idx === blockIndex ? 1 : 0.2,
                  fontWeight: idx === blockIndex ? "bold" : "normal",
                  marginRight: "6px",
                }}
              >
                {word}
              </span>
            ))}
          </div>
          {!running ? (
            <button onClick={() => setRunning(true)}>Başlat</button>
          ) : (
            <button onClick={() => setRunning(false)}>Durdur</button>
          )}
        </div>
      )}

      {/* Gölgeli */}
      {step === 5 && selectedStory && (
        <div className="reading">
          <h3>🌑 Gölgeli Okuma</h3>
          <p className="timer">Kalan Süre: {timeLeft} sn</p>
          <div className="story-content">
            {getBlocks(selectedStory.content, 15).map((block, idx) => (
              <p
                key={idx}
                style={{
                  opacity: idx === blockIndex ? 1 : 0.2,
                  fontWeight: idx === blockIndex ? "bold" : "normal",
                }}
              >
                {block}
              </p>
            ))}
          </div>
          {!running ? (
            <button onClick={() => setRunning(true)}>Başlat</button>
          ) : (
            <button onClick={() => setRunning(false)}>Durdur</button>
          )}
        </div>
      )}

      {/* İstatistik */}
      {selectedStory && (
        <div className="stats">
          <p>Kelime Sayısı: {totalWords}</p>
          <p>Okunan Kelime: {wordsRead}</p>
          <p>İlerleme: %{progress}</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
