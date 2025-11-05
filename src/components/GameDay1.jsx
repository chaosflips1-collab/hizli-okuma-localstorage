import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameDay1.css";

// Mini oyun: Firestore'a yazmaz, alert üretmez.

const HIGH_KEY = "gd1HighScore";
const MUTE_KEY = "gd1Muted";

const defaultWords = [
  "kedi","balık","masa","elma","araba","okul","mavi","yeşil","kalem","çiçek",
  "bulut","güneş","kuş","kitap","oyun","su","kapı","tahta","süt","peynir",
  "baba","anne","defter","sandalye","zil","yol","dost","deniz","martı","çay",
];

export default function GameDay1({ words = defaultWords }) {
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const audioCtxRef = useRef(null);

  const [ui, setUi] = useState({
    state: "menu", // menu | playing | gameover
    paused: false,
    muted: localStorage.getItem(MUTE_KEY) === "1",
    score: 0,
    level: 1,
    lives: 5,
    high: Number(localStorage.getItem(HIGH_KEY) || 0),
    targetWord: pickRandom(words),
  });

  const gameRef = useRef({
    w: 0, h: 0,
    laneCount: 3,
    player: { lane: 1, targetLane: 1, laneX: [0,0,0], x: 0, y: 0 },
    speed: 3.5, baseSpeed: 3.5, maxSpeed: 10.5,
    time: 0,
    spawnTimer: 0, wordTimer: 0, treeTimer: 0, cloudTimer: 0,
    obstacles: [], wordCards: [], trees: [], clouds: [], particles: [],
    shake: 0,
    lastHitAt: -9999, invulMs: 1200,
  });

  // -------- ses
  const beep = (freq = 880, ms = 90, type = "sine") => {
    if (ui.muted) return;
    try {
      if (!audioCtxRef.current) {
        // eslint-disable-next-line no-undef
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type; osc.frequency.value = freq; gain.gain.value = 0.08;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.05);
      }, ms);
    } catch {}
  };

  const speakTarget = () => {
    try {
      const utter = new SpeechSynthesisUtterance(ui.targetWord);
      utter.lang = "tr-TR";
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    } catch {}
  };

  // -------- start / end
  const startGame = () => {
    const g = gameRef.current;
    g.speed = g.baseSpeed = 3.5; g.maxSpeed = 10.5;
    g.time = 0; g.spawnTimer = 0; g.wordTimer = 0; g.treeTimer = 0; g.cloudTimer = 0;
    g.obstacles = []; g.wordCards = []; g.trees = []; g.clouds = []; g.particles = []; g.shake = 0; g.lastHitAt = -9999;
    g.player = { lane: 1, targetLane: 1, laneX: g.player.laneX, x: g.player.laneX[1] || g.w/2, y: g.h * 0.78 };
    setUi(u => ({ ...u, state: "playing", paused: false, score: 0, level: 1, lives: 5, targetWord: pickRandom(words) }));
  };

  const endGame = (finalScore) => {
    const high = Math.max(ui.high, finalScore);
    localStorage.setItem(HIGH_KEY, String(high));
    setUi(u => ({ ...u, state: "gameover", high }));
  };

  // -------- input
  useEffect(() => {
    const onKeyDown = (e) => {
      if (ui.state === "menu" && (e.key === "Enter" || e.key === " ")) { startGame(); return; }
      if (ui.state !== "playing") return;
      if (e.key === "Escape") { setUi(u => ({ ...u, paused: !u.paused })); }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") move(-1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") move(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.state]);

  useEffect(() => {
    const el = canvasRef.current?.parentElement; if (!el) return;
    let startX = 0;
    const onDown = (e) => { const x = "touches" in e ? e.touches[0].clientX : e.clientX; startX = x; };
    const onUp = (e) => {
      const x = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
      const dx = x - startX;
      if (Math.abs(dx) < 6) { const r = el.getBoundingClientRect(); (x < r.left + r.width/2) ? move(-1) : move(1); }
      else { (dx < 0) ? move(-1) : move(1); }
    };
    el.addEventListener("mousedown", onDown); el.addEventListener("mouseup", onUp);
    el.addEventListener("touchstart", onDown, { passive: true }); el.addEventListener("touchend", onUp);
    return () => { el.removeEventListener("mousedown", onDown); el.removeEventListener("mouseup", onUp); el.removeEventListener("touchstart", onDown); el.removeEventListener("touchend", onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.state]);

  const move = (dir) => {
    if (ui.state !== "playing") return;
    const g = gameRef.current;
    const next = Math.min(g.laneCount - 1, Math.max(0, g.player.targetLane + dir));
    if (next !== g.player.targetLane) { g.player.targetLane = next; beep(650, 70, "square"); }
  };

  // -------- canvas & loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.parentElement.clientWidth;
      const h = Math.min(560, Math.max(360, Math.floor(w * 0.56)));
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const g = gameRef.current; g.w = w; g.h = h;
      const roadW = Math.min(520, w * 0.86); const left = (w - roadW) / 2;
      g.player.laneX = [ left + roadW*0.2, left + roadW*0.5, left + roadW*0.8 ];
      g.player.x = g.player.laneX[g.player.lane]; g.player.y = h * 0.78;
    };
    resize(); const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement);

    let last = performance.now();
    const loop = (t) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min(32, t - last); last = t;
      const g = gameRef.current;
      if (ui.state === "playing" && !ui.paused) { update(g, dt); draw(ctx, g); }
      else { draw(ctx, g, true); }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.state, ui.paused, ui.muted, ui.targetWord]);

  const update = (g, dt) => {
    g.time += dt/1000;
    const targetSpeed = Math.min(g.maxSpeed, g.baseSpeed + g.time * 0.25);
    g.speed += (targetSpeed - g.speed) * 0.02;

    const nextLevel = 1 + Math.floor(g.time / 14);
    if (nextLevel !== ui.level) {
      setUi(u => ({ ...u, level: nextLevel })); beep(1100, 120, "triangle");
      for (let i=0;i<24;i++) g.particles.push({ x:g.w/2, y:g.h*0.2, vx:(Math.random()-0.5)*3, vy:Math.random()*-2-1, life:700, color:`hsl(${Math.random()*360},80%,50%)`, born:performance.now() });
    }

    // engel
    g.spawnTimer -= dt;
    if (g.spawnTimer <= 0) {
      g.spawnTimer = Math.max(900, 1700 - g.time * 30);
      const lane = (Math.random()*g.laneCount)|0;
      g.obstacles.push({ lane, z: 0, size: 26 + Math.random()*16 });
    }

    // kelime kartı
    g.wordTimer -= dt;
    if (g.wordTimer <= 0) {
      const faster = Math.max(520, 920 - g.time*25);
      g.wordTimer = faster;
      const lane = (Math.random()*g.laneCount)|0;
      const isCorrect = Math.random() < 0.5;
      const text = isCorrect ? ui.targetWord : pickRandomDifferent(words, ui.targetWord);
      g.wordCards.push({ lane, z: 0, text });
    }

    // dekor
    g.treeTimer -= dt;
    if (g.treeTimer <= 0) {
      g.treeTimer = 600 + Math.random()*400;
      g.trees.push({ side: "L", z: 0, s: 0.8 + Math.random()*0.5 });
      g.trees.push({ side: "R", z: 0, s: 0.8 + Math.random()*0.5 });
    }
    g.cloudTimer -= dt;
    if (g.cloudTimer <= 0) {
      g.cloudTimer = 900 + Math.random()*800;
      g.clouds.push({ x: -60, y: 40 + Math.random()*80, w: 90 + Math.random()*70, h: 28 + Math.random()*12, speed: 0.3 + Math.random()*0.2 });
    }

    // oyuncu easing (koşu zıplaması)
    const bob = Math.sin(g.time * 10) * 2; // yukarı-aşağı
    g.player.y = g.h * 0.78 + bob;
    g.player.x += (g.player.laneX[g.player.targetLane] - g.player.x) * 0.22;

    const adv = g.speed * (dt/16);
    for (const o of g.obstacles) o.z += adv;
    for (const c of g.wordCards) c.z += adv;
    for (const t of g.trees) t.z += adv * 0.8;

    for (const cl of g.clouds) cl.x += cl.speed;
    g.clouds = g.clouds.filter(cl => cl.x < g.w + 120);

    // çarpışmalar
    const now = performance.now();
    const invul = now - g.lastHitAt < g.invulMs;

    const hitIdx = g.obstacles.findIndex(o => o.lane === g.player.targetLane && o.z > 435 && o.z < 458);
    if (hitIdx >= 0 && !invul) {
      g.obstacles.splice(hitIdx, 1);
      g.shake = 12; g.lastHitAt = now; beep(220, 120, "sawtooth");
      setUi(u => {
        const lives = u.lives - 1;
        if (lives <= 0) endGame(u.score);
        return { ...u, lives: Math.max(0, lives) };
      });
    }

    const cardIdx = g.wordCards.findIndex(c => c.lane === g.player.targetLane && c.z > 430 && c.z < 465);
    if (cardIdx >= 0) {
      const card = g.wordCards.splice(cardIdx, 1)[0];
      if (card.text === ui.targetWord) {
        beep(980, 90, "sine");
        setUi(u => ({ ...u, score: u.score + 10, targetWord: pickRandom(words) }));
        for (let i=0;i<12;i++) g.particles.push({ x:g.player.x, y:g.player.y-26, vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2-1, life:450, color:"gold", born:performance.now() });
      } else if (!invul) {
        g.shake = 10; g.lastHitAt = now; beep(260, 110, "square");
        setUi(u => { const lives = u.lives - 1; if (lives <= 0) endGame(u.score); return { ...u, lives: Math.max(0, lives) }; });
      }
    }

    // particles
    const tnow = performance.now();
    g.particles = g.particles.filter(p => tnow - p.born < p.life);
    for (const p of g.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.02; }

    // temizlik
    g.obstacles = g.obstacles.filter(o => o.z < 800);
    g.wordCards  = g.wordCards.filter(c => c.z < 800);
    g.trees = g.trees.filter(t => t.z < 800);

    if (g.shake > 0) g.shake -= 0.6;
  };

  const draw = (ctx, g, dim=false) => {
    // gökyüzü
    const grd = ctx.createLinearGradient(0,0,0,g.h);
    grd.addColorStop(0, "#a7d7ff"); grd.addColorStop(0.55, "#cfe9ff"); grd.addColorStop(1, "#e8f4ff");
    ctx.fillStyle = grd; ctx.fillRect(0,0,g.w,g.h);

    drawMountains(ctx, g);
    for (const cl of g.clouds) drawCloud(ctx, cl.x, cl.y, cl.w, cl.h);

    const roadTopY = g.h*0.32, roadBottomY = g.h*0.95, roadTopW = g.w*0.14, roadBottomW = Math.min(g.w*0.86, 520);

    // çimen
    ctx.fillStyle = "#b2df8a";
    ctx.beginPath(); ctx.moveTo(0, roadTopY); ctx.lineTo((g.w - roadTopW)/2, roadTopY); ctx.lineTo((g.w - roadBottomW)/2, roadBottomY); ctx.lineTo(0, roadBottomY); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(g.w, roadTopY); ctx.lineTo((g.w + roadTopW)/2, roadTopY); ctx.lineTo((g.w + roadBottomW)/2, roadBottomY); ctx.lineTo(g.w, roadBottomY); ctx.closePath(); ctx.fill();

    const sx = g.shake ? (Math.random()-0.5)*g.shake : 0;
    const sy = g.shake ? (Math.random()-0.5)*g.shake : 0;
    ctx.save(); ctx.translate(sx, sy);

    // yol
    ctx.fillStyle = "#263238";
    ctx.beginPath();
    ctx.moveTo((g.w - roadTopW)/2, roadTopY);
    ctx.lineTo((g.w + roadTopW)/2, roadTopY);
    ctx.lineTo((g.w + roadBottomW)/2, roadBottomY);
    ctx.lineTo((g.w - roadBottomW)/2, roadBottomY);
    ctx.closePath(); ctx.fill();

    // şerit çizgileri
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2;
    for (let i=1;i<g.laneCount;i++) {
      const tX = (g.w - roadTopW)/2 + (roadTopW*i)/g.laneCount;
      const bX = (g.w - roadBottomW)/2 + (roadBottomW*i)/g.laneCount;
      ctx.beginPath(); ctx.moveTo(tX, roadTopY); ctx.lineTo(bX, roadBottomY); ctx.stroke();
    }

    // zemin çizgileri
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    for (let z=0; z<14; z++) {
      const p = z*60 + ((g.time*220)%60);
      const t = p/800; const y = roadTopY + (roadBottomY-roadTopY)*t; const w = roadTopW + (roadBottomW-roadTopW)*t;
      ctx.beginPath(); ctx.moveTo((g.w - w)/2, y); ctx.lineTo((g.w + w)/2, y); ctx.stroke();
    }

    const proj = (lane, z) => {
      const t = Math.min(1, z/800);
      const y = roadTopY + (roadBottomY - roadTopY) * t;
      const w = roadTopW + (roadBottomW - roadTopW) * t;
      const laneX = (g.w - w)/2 + w*(0.5 + (lane-1)*0.3);
      return { x: laneX, y, scale: 0.4 + t*0.9 };
    };

    // ağaçlar
    for (const tr of g.trees) {
      const t = Math.min(1, tr.z/800);
      const y = roadTopY + (roadBottomY-roadTopY)*t;
      const w = roadTopW + (roadBottomW-roadTopW)*t;
      const x = tr.side === "L" ? (g.w - w)/2 - 20 : (g.w + w)/2 + 20;
      drawTree(ctx, x, y, tr.s*(0.5 + t));
    }

    // kelime kartları (doğru kelimeye altın parıltı)
    for (const c of g.wordCards) {
      const p = proj(c.lane, c.z);
      const W = 120*p.scale, H = 48*p.scale, x = p.x - W/2, y = p.y - H - 8;

      roundRect(ctx, x, y, W, H, 10);
      ctx.fillStyle = "#fffde7"; ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffecb3"; 
      ctx.stroke();

      if (c.text === ui.targetWord) {
        ctx.save();
        ctx.shadowColor = "rgba(255,215,0,0.8)";
        ctx.shadowBlur = 16;
        roundRect(ctx, x, y, W, H, 10);
        ctx.strokeStyle = "rgba(255,215,0,0.9)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
        roundRect(ctx, x, y, W, H, 10); ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.stroke();
        ctx.restore();
      }

      const fontSize = fitText(ctx, c.text, W - 12, Math.max(14, Math.floor(22*p.scale)), 10);
      ctx.font = `bold ${fontSize}px Poppins, Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(1, fontSize/10); ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.strokeText(c.text, p.x, y + H/2);
      ctx.fillStyle = "#3e2723"; ctx.fillText(c.text, p.x, y + H/2);
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    }

    // engeller
    for (const o of g.obstacles) {
      const p = proj(o.lane, o.z);
      const w = o.size*p.scale*1.15, h = o.size*p.scale*1.35;
      ctx.fillStyle = "#546e7a"; ctx.strokeStyle = "#b0bec5"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.x - w*0.6, p.y - h);
      ctx.lineTo(p.x + w*0.6, p.y - h); ctx.lineTo(p.x + w, p.y); ctx.lineTo(p.x - w, p.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    // KOŞAN ÇOCUK (daha belirgin koşu: kol + baş salınımı)
    const runPhase = Math.sin(g.time * 12);
    drawRunner(ctx, g.player.x, g.player.y, runPhase, (performance.now() - g.lastHitAt) < g.invulMs);

    // parçacıklar
    for (const p of g.particles) { ctx.fillStyle = p.color || "white"; ctx.globalAlpha = 0.9; ctx.fillRect(p.x, p.y, 2.5, 2.5); ctx.globalAlpha = 1; }

    ctx.restore();

    // HUD sol üst yine dursun
    ctx.fillStyle = "#0d47a1"; ctx.font = "bold 16px Poppins, Arial";
    ctx.fillText(`LV  ${ui.level}`, 12, 24);
    ctx.fillText(`SCORE ${ui.score}`, 12, 46);
    ctx.fillText(`HIGH ${ui.high}`, 12, 68);

    if (dim) {
      ctx.fillStyle = "rgba(0,0,0,0.38)"; ctx.fillRect(0,0,g.w,g.h);
      ctx.fillStyle = "white"; ctx.textAlign = "center";
      if (ui.state === "menu") {
        ctx.font = "bold 22px Poppins, Arial";
        ctx.fillText("GameDay1 — Kelime Koşusu", g.w/2, g.h/2 - 8);
        ctx.font = "16px Poppins, Arial";
        ctx.fillText("← → ile şerit değiş | Hedef kelimeyi topla", g.w/2, g.h/2 + 18);
        ctx.fillText("ENTER/Dokun: Başlat", g.w/2, g.h/2 + 38);
      } else if (ui.paused) {
        ctx.font = "bold 22px Poppins, Arial";
        ctx.fillText("PAUSE", g.w/2, g.h/2);
      } else if (ui.state === "gameover") {
        ctx.font = "bold 22px Poppins, Arial";
        ctx.fillText("OYUN BİTTİ", g.w/2, g.h/2 - 12);
        ctx.font = "16px Poppins, Arial";
        ctx.fillText(`Skor: ${ui.score}  |  En İyi: ${ui.high}`, g.w/2, g.h/2 + 14);
      }
      ctx.textAlign = "left";
    }
  };

  // ----- çizim yardımcıları -----
  const drawRunner = (ctx, x, y, phase, blinking) => {
    ctx.save();
    if (blinking) ctx.globalAlpha = 0.5 + 0.5 * Math.sin(performance.now()/60);

    // gövde hafif öne eğik
    ctx.translate(0, Math.sin(performance.now()/140) * 0.8);
    ctx.rotate(phase * 0.03);

    // gövde
    ctx.fillStyle = "#1e88e5";
    roundRect(ctx, x-12, y-30, 24, 26, 6); ctx.fill();

    // baş (hafif sallanma)
    ctx.save();
    ctx.translate(0, Math.sin(performance.now()/80) * 0.6);
    ctx.fillStyle = "#ffcc80"; ctx.beginPath(); ctx.arc(x, y-42, 9, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // sırt çantası
    ctx.fillStyle = "#8e24aa"; roundRect(ctx, x-16, y-28, 10, 18, 3); ctx.fill();

    // kollar (salınım)
    ctx.strokeStyle = "#263238"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x-10, y-22); ctx.lineTo(x-10 + phase*4, y-8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+10, y-22); ctx.lineTo(x+10 - phase*4, y-8); ctx.stroke();

    // bacaklar
    ctx.beginPath(); ctx.moveTo(x-6, y-4); ctx.lineTo(x-6 + phase*3, y+16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+6, y-4); ctx.lineTo(x+6 - phase*3, y+16); ctx.stroke();

    // ayaklar
    ctx.fillStyle = "#37474f";
    ctx.beginPath(); ctx.moveTo(x-8 + phase*3, y+18); ctx.lineTo(x-2 + phase*3, y+18); ctx.lineTo(x-5 + phase*3, y+22); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+8 - phase*3, y+18); ctx.lineTo(x+2 - phase*3, y+18); ctx.lineTo(x+5 - phase*3, y+22); ctx.closePath(); ctx.fill();

    ctx.restore();
  };

  const drawCloud = (ctx, x, y, w, h) => {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.ellipse(x, y, w*0.35, h*0.6, 0, 0, Math.PI*2);
    ctx.ellipse(x + w*0.35, y-6, w*0.28, h*0.55, 0, 0, Math.PI*2);
    ctx.ellipse(x + w*0.7, y, w*0.36, h*0.62, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  };

  const drawMountains = (ctx, g) => {
    ctx.save();
    ctx.fillStyle = "#bbdefb";
    ctx.beginPath();
    ctx.moveTo(0, g.h*0.45);
    ctx.lineTo(g.w*0.18, g.h*0.28);
    ctx.lineTo(g.w*0.34, g.h*0.46);
    ctx.lineTo(g.w*0.5, g.h*0.30);
    ctx.lineTo(g.w*0.66, g.h*0.48);
    ctx.lineTo(g.w*0.84, g.h*0.32);
    ctx.lineTo(g.w, g.h*0.47);
    ctx.lineTo(g.w, g.h*0.32);
    ctx.lineTo(0, g.h*0.32);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  const drawTree = (ctx, x, y, s) => {
    ctx.save();
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(x-4*s, y-24*s, 8*s, 24*s);
    ctx.fillStyle = "#388e3c";
    ctx.beginPath(); ctx.moveTo(x, y-44*s); ctx.lineTo(x+18*s, y-24*s); ctx.lineTo(x-18*s, y-24*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y-34*s); ctx.lineTo(x+14*s, y-18*s); ctx.lineTo(x-14*s, y-18*s); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  const roundRect = (ctx, x, y, w, h, r = 8) => {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const fitText = (ctx, text, maxWidth, maxFont, minFont) => {
    let size = maxFont;
    while (size > minFont) { ctx.font = `bold ${size}px Poppins, Arial`; if (ctx.measureText(text).width <= maxWidth) break; size -= 1; }
    return size;
  };

  const onToggleMute = () => { const next = !ui.muted; localStorage.setItem(MUTE_KEY, next ? "1" : "0"); setUi(u => ({ ...u, muted: next })); };
  const onTogglePause = () => { if (ui.state !== "playing") return; setUi(u => ({ ...u, paused: !u.paused })); };

  return (
    <div className="gd1-wrap">
      <div className="gd1-header">
        <button className="gd1-btn" onClick={() => navigate("/panel")}>🚪 Çık</button>

        {ui.state === "menu" && <button className="gd1-btn primary" onClick={startGame}>▶️ Başlat</button>}
        {ui.state === "playing" && <button className="gd1-btn" onClick={onTogglePause}>{ui.paused ? "▶️ Devam" : "⏸️ Duraklat"}</button>}
        {ui.state === "gameover" && <button className="gd1-btn primary" onClick={startGame}>🔁 Tekrar Oyna</button>}

        <button className="gd1-btn" onClick={onToggleMute}>{ui.muted ? "🔇" : "🔊"}</button>
      </div>

      {/* HEDEF KELİME BANNER – çok belirgin */}
      {ui.state !== "menu" && (
        <div className="gd1-target">
          <span className="gd1-chip">HEDEF</span>
          <span className="gd1-word">{ui.targetWord}</span>
          <button className="gd1-say" onClick={speakTarget} title="Oku">🔊</button>
        </div>
      )}

      <div className="gd1-canvas-holder" onClick={() => { if (ui.state === "menu") startGame(); }}>
        <canvas ref={canvasRef} className="gd1-canvas" />
      </div>

      {ui.state === "playing" && (
        <div className="gd1-hud">
          <div>LV {ui.level}</div>
          <div>Skor: {ui.score}</div>
          <div>En İyi: {ui.high}</div>
          <div>♥ {ui.lives}</div>
        </div>
      )}

      {ui.state === "gameover" && (
        <div className="gd1-footer">
          <div className="gd1-info">Skor: {ui.score} — En İyi: {ui.high}</div>
          <div className="gd1-row">
            <button className="gd1-btn primary" onClick={startGame}>🔁 Tekrar Oyna</button>
            <button className="gd1-btn" onClick={() => navigate("/panel")}>Panele Dön</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- yardımcılar ----
function pickRandom(arr) { return arr[(Math.random() * arr.length) | 0]; }
function pickRandomDifferent(arr, notThis) {
  if (arr.length <= 1) return notThis;
  let w = notThis; while (w === notThis) w = pickRandom(arr);
  return w;
}
