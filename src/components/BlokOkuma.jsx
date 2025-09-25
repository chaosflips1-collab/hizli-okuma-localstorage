// src/components/BlokOkuma.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./BlokOkuma.css";
import stories from "../data/stories";

export default function BlokOkuma() {
  const navigate = useNavigate();

  const [selectedStory, setSelectedStory] = useState(null);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(200);
  const [progress, setProgress] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);

  const intervalRef = useRef(null);

  const totalWords = words.length;

  useEffect(() => {
    if (running && totalWords > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          setWordsRead((r) => r + 1);

          if ((next + 1) % 15 === 0) {
            setProgress((p) => Math.min(p + 1, 100));
          }

          if (progress >= 100 || next >= totalWords) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return prev;
          }

          return next;
        });
      }, speed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [running, speed, totalWords, progress]);

  const handleStart = () => {
    if (!selectedStory) return;
    const storyWords = selectedStory.content.split(" ");
    setWords(storyWords);
    setCurrentIndex(0);
    setWordsRead(0);
    setProgress(0);
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleExit = () => {
    setRunning(false);
    setWords([]);
    setSelectedStory(null);
    navigate("/panel");
  };

  return (
    <div className="blok-container">
      <h1>📚 Blok Okuma</h1>
      <p className="desc">
        Kelimeleri toplu halde görebilme yeteneğini geliştirmek için uygulanan
        bir tekniktir. Sözcükleri bloklar halinde okumak hızlı okumanın temel
        yöntemlerindendir.
      </p>

      <button className="open-library-btn" onClick={() => setShowLibrary(true)}>
        📖 Kütüphane
      </button>

      {showLibrary && (
        <div className="modal">
          <div className="modal-content">
            <h2>📖 Hikaye Seç</h2>
            {stories.map((story) => (
              <button
                key={story.id}
                className={`story-btn ${
                  selectedStory?.id === story.id ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedStory(story);
                  setShowLibrary(false);
                }}
              >
                {story.title}
              </button>
            ))}
            <button className="close-btn" onClick={() => setShowLibrary(false)}>
              Kapat
            </button>
          </div>
        </div>
      )}

      <div className="screen">
        {words.length > 0 && currentIndex < words.length ? (
          <span>{words[currentIndex]}</span>
        ) : (
          <span className="placeholder">
            Başlamak için hikaye seçin ve Başla’ya tıklayın
          </span>
        )}
      </div>

      <div className="controls">
        <label>
          ⏱ Hız (ms):
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed} ms</span>
        </label>

        <div className="buttons">
          {!running ? (
            <button onClick={handleStart} disabled={!selectedStory}>
              ▶ Başla
            </button>
          ) : (
            <button onClick={handleStop}>⏹ Durdur</button>
          )}
          <button className="exit-btn" onClick={handleExit}>
            ❌ Çıkış
          </button>
        </div>
      </div>

      <div className="stats">
        <p>Kelime Sayısı: {totalWords}</p>
        <p>Okunan Kelime: {wordsRead}</p>
        <p>İlerleme: %{progress}</p>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
}
