import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameDay3.css";

const HIGH3_KEY = "gd3_high";
const MUTE3_KEY = "gd3_mute";

const WORDS = [
  "book","read","write","speak","think","learn","dream","focus","smart","light",
  "time","happy","play","draw","count","music","blue","green","quick","answer"
];

const CFG = {
  duration: 45,
  lives: 5,
  gravity: 0.48,
  drag: 0.995,
  maxPull: 120,
  shotCooldown: 380,
  targetCount: 6,
  goodRatio: 0.5,
  rockRadius: 10,
};

export default function GameDay3({ words = WORDS }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const audioCtxRef = useRef(null);

  const [ui, setUi] = useState({
    state: "menu", // menu | playing | gameover
    muted: localStorage.getItem(MUTE3_KEY) === "1",
    score: 0,
    high: Number(localStorage.getItem(HIGH3_KEY) || 0),
    lives: CFG.lives,
    timeLeft: CFG.duration,
    target: pick(words),
  });

  const g = useRef({
    w: 0, h: 0,
    groundY: 0,
    clouds: [],
    sling: { x: 120, y: 0, pullX: 0, pullY: 0, pulling: false, lastShotAt: -9999 },
    rock: { x: 0, y: 0, vx: 0, vy: 0, flying: false },
    blocks: [],           // {x,y,w,h,text,good,dead,vx,vy}
    particles: [],
  });

  // ---------- SES
  const beep = (f=880, ms=90, type="sine") => {
    if (ui.muted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type; osc.frequency.value = f; gain.gain.value = 0.08;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      setTimeout(()=>{ gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.05); osc.stop(ctx.currentTime+0.05); }, ms);
    } catch {}
  };

  const sayTarget = () => {
    try {
      const u = new SpeechSynthesisUtterance(ui.target);
      u.lang = "en-US";
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch {}
  };

  // ---------- KLAVYE
  useEffect(() => {
    const down = (e) => {
      if (ui.state === "menu" && (e.key === "Enter" || e.key === " ")) { start(); return; }
      if (ui.state !== "playing") return;
      if ((e.key === " " || e.key === "Enter") && !g.current.sling.pulling) {
        quickTapShot();
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.state]);

  // ---------- DOKUNMATİK / MOUSE (sürükle-bırak)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (ev) => {
      const r = canvas.getBoundingClientRect();
      const cX = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const cY = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
      return { x: cX - r.left, y: cY - r.top };
    };

    const down = (ev) => {
      if (ui.state === "menu") { start(); return; }
      if (ui.state !== "playing") return;
      const p = getPos(ev);
      const s = g.current.sling;
      if (dist(p.x, p.y, s.x, s.y) < 48) {
        s.pulling = true;
        s.pullX = clamp(p.x - s.x, -CFG.maxPull, CFG.maxPull);
        s.pullY = clamp(p.y - s.y, -CFG.maxPull, CFG.maxPull);
        ev.preventDefault();
      }
    };

    const move = (ev) => {
      if (!g.current.sling.pulling) return;
      const p = getPos(ev);
      const s = g.current.sling;
      s.pullX = clamp(p.x - s.x, -CFG.maxPull, CFG.maxPull);
      s.pullY = clamp(p.y - s.y, -CFG.maxPull, CFG.maxPull);
      ev.preventDefault();
    };

    const up = () => {
      const s = g.current.sling;
      if (!s.pulling) return;
      shootFromPull();
      s.pulling = false;
      s.pullX = s.pullY = 0;
    };

    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", up);
    canvas.addEventListener("mouseleave", up);

    canvas.addEventListener("touchstart", down, { passive:false });
    canvas.addEventListener("touchmove", move, { passive:false });
    canvas.addEventListener("touchend", up);

    return () => {
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", up);
      canvas.removeEventListener("mouseleave", up);
      canvas.removeEventListener("touchstart", down);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.state]);

  // ---------- BAŞLAT / BİTİR
  const start = () => {
    const c = g.current;
    c.clouds = makeClouds();

    // ✅ ÖNCE hedefi seç
    const newTarget = pick(words);

    // ✅ Seçilen hedefe göre level kur (hedef sahnede olacak)
    const w = canvasRef.current?.parentElement?.clientWidth || 900;
    c.blocks = makeLevel(newTarget, words, w);

    // sapan/taş reset
    c.rock.flying = false;
    c.sling.lastShotAt = -9999;

    // UI güncelle
    setUi(u => ({
      ...u,
      state: "playing",
      score: 0,
      lives: CFG.lives,
      timeLeft: CFG.duration,
      target: newTarget,
    }));
  };

  const end = (finalScore) => {
    const high = Math.max(ui.high, finalScore);
    localStorage.setItem(HIGH3_KEY, String(high));
    setUi(u => ({ ...u, state: "gameover", high }));
  };

  // ---------- SAYAÇ
  useEffect(() => {
    if (ui.state !== "playing") return;
    const t = setInterval(() => setUi(u => u.state==="playing" ? {...u, timeLeft: Math.max(0, u.timeLeft-1)} : u), 1000);
    return () => clearInterval(t);
  }, [ui.state]);
  useEffect(() => { if (ui.state==="playing" && ui.timeLeft<=0) end(ui.score); /* eslint-disable-next-line */ }, [ui.timeLeft]);

  // ---------- CANVAS & LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.parentElement.clientWidth;
      const h = Math.min(560, Math.max(380, Math.floor(w*0.56)));
      canvas.width = Math.floor(w*dpr);
      canvas.height = Math.floor(h*dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);

      const c = g.current;
      c.w = w; c.h = h;
      c.groundY = h * 0.82;
      c.sling.y = h * 0.75;
      c.sling.x = Math.min(140, w * 0.18);
      if (!c.rock.flying) { c.rock.x = c.sling.x; c.rock.y = c.sling.y; }
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement);

    let last = performance.now();
    const loop = (t) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min(32, t-last); last = t;
      draw(ctx, dt);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.state, ui.muted, ui.target]);

  // ---------- ATIŞ
  const nowMs = () => performance.now();

  const shootFromPull = () => {
    const s = g.current.sling;
    const r = g.current.rock;
    if (nowMs() - s.lastShotAt < CFG.shotCooldown) return;
    const dx = s.pullX, dy = s.pullY;
    const power = Math.min(CFG.maxPull, Math.hypot(dx, dy));
    if (power < 10) return;
    const k = 0.18;
    r.x = s.x; r.y = s.y; r.vx = -dx * k; r.vy = -dy * k; r.flying = true;
    s.lastShotAt = nowMs();
    beep(760, 90, "triangle");
  };

  const quickTapShot = () => {
    const s = g.current.sling;
    const r = g.current.rock;
    if (nowMs() - s.lastShotAt < CFG.shotCooldown) return;
    r.x = s.x; r.y = s.y; r.vx = 6.5; r.vy = -6.0; r.flying = true;
    s.lastShotAt = nowMs();
    beep(700, 80, "triangle");
  };

  // ---------- ANA ÇİZİM & FİZİK
  const draw = (ctx, dt) => {
    const c = g.current;

    // arka plan
    const sky = ctx.createLinearGradient(0,0,0,c.h);
    sky.addColorStop(0,"#a3d7ff"); sky.addColorStop(1,"#e8f4ff");
    ctx.fillStyle = sky; ctx.fillRect(0,0,c.w,c.h);

    for (const cl of c.clouds) { drawCloud(ctx, cl.x, cl.y, cl.w, cl.h); cl.x += cl.s; if (cl.x > c.w + 90) { cl.x = -90; cl.y = 20 + Math.random()*90; } }

    ctx.fillStyle = "#bde8a8";
    ctx.beginPath(); ctx.ellipse(c.w/2, c.h*0.95, c.w*0.9, c.h*0.25, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    for (let i=0;i<3;i++){ ctx.beginPath(); ctx.ellipse(c.w/2, c.h*0.95, c.w*0.86 - i*80, c.h*0.22 - i*16, 0, 0, Math.PI*2); ctx.stroke(); }

    drawPlatforms(ctx, c.w, c.h);

    // bloklar
    for (const b of c.blocks) {
      if (b.dead) continue;
      if (Math.abs(b.vx) > 0.01 || Math.abs(b.vy) > 0.01) {
        b.vy += CFG.gravity * 0.25;
        b.x += b.vx; b.y += b.vy;
        b.vx *= 0.992; b.vy *= 0.992;
        if (b.y + b.h/2 >= c.groundY) { b.y = c.groundY - b.h/2; b.vy *= -0.35; b.vx *= 0.85; }
      }
      drawBlock(ctx, b);
    }

    // kaya fiziği
    const r = c.rock;
    if (r.flying) {
      r.vy += CFG.gravity;
      r.vx *= CFG.drag; r.vy *= CFG.drag;
      r.x += r.vx; r.y += r.vy;

      if (r.y + CFG.rockRadius >= c.groundY) {
        r.y = c.groundY - CFG.rockRadius; r.vy *= -0.45; r.vx *= 0.85;
        if (Math.abs(r.vx) < 0.5 && Math.abs(r.vy) < 0.65) r.flying = false;
      }
      if (r.x < -40 || r.x > c.w + 40 || r.y > c.h + 40) r.flying = false;

      // çarpışma
      for (const b of c.blocks) {
        if (b.dead) continue;
        if (circleRect(r.x, r.y, CFG.rockRadius, b.x-b.w/2, b.y-b.h/2, b.w, b.h)) {
          const nx = Math.sign(r.vx || 1), ny = Math.sign(r.vy || 1);
          b.vx += nx * 2.2; b.vy += ny * 1.8;
          r.vx *= -0.55; r.vy *= -0.55;

          if (b.good) {
            spawnConfetti(c.particles, b.x, b.y, "#ffd54f");
            b.dead = true;  // ✅ önce öldür
            // ✅ kalan iyi bloklardan hedef seç; yoksa yeni level kur
            const remainingGoods = c.blocks.filter(x => x.good && !x.dead);
            if (remainingGoods.length > 0) {
              const nextTarget = remainingGoods[(Math.random()*remainingGoods.length)|0].text;
              setUi(u => ({ ...u, score: u.score + 10, target: nextTarget }));
            } else {
              const nextTarget = pick(words);
              const w = c.w || (canvasRef.current?.parentElement?.clientWidth || 900);
              c.blocks = makeLevel(nextTarget, words, w);
              setUi(u => ({ ...u, score: u.score + 10, target: nextTarget }));
            }
            beep(990, 100, "sine");
          } else {
            setUi(u => {
              const lives = u.lives - 1;
              if (lives <= 0) end(u.score);
              return { ...u, lives };
            });
            b.dead = true;
            beep(260, 120, "square");
          }
          break;
        }
      }
    }

    // parçacıklar
    for (const p of c.particles) {
      p.vx *= 0.98; p.vy += 0.2; p.x += p.vx; p.y += p.vy; p.life -= dt;
      ctx.fillStyle = `rgba(0,0,0,${Math.max(0,p.life/700)*0.15})`;
      ctx.beginPath(); ctx.arc(p.x+1, p.y+1, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
    }
    g.current.particles = g.current.particles.filter(p => p.life > 0);

    // sapan
    drawSlingshot(ctx, c.sling, r);

    // HUD
    ctx.fillStyle = "#0d47a1"; ctx.font = "bold 16px Poppins, Arial";
    ctx.fillText(`SCORE ${ui.score}`, 12, 24);
    ctx.fillText(`HIGH ${ui.high}`, 12, 46);
    ctx.fillText(`TIME ${ui.timeLeft}s`, 12, 68);
    for (let i=0;i<ui.lives;i++) drawHeart(ctx, c.w - 20 - i*24, 24, 8);

    // overlay
    if (ui.state !== "playing") {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0,0,c.w,c.h);
      ctx.fillStyle = "white"; ctx.textAlign = "center";
      if (ui.state === "menu") {
        ctx.font = "bold 22px Poppins, Arial";
        ctx.fillText("GameDay3 — Sapanla Kelime Vur", c.w/2, c.h/2 - 12);
        ctx.font = "16px Poppins, Arial";
        ctx.fillText("Hedef kelimeyi taşıyan kutuyu vurmak için lastiği sürükleyip bırak", c.w/2, c.h/2 + 16);
        ctx.fillText("Başlamak için dokun/ENTER", c.w/2, c.h/2 + 38);
      } else if (ui.state === "gameover") {
        ctx.font = "bold 22px Poppins, Arial";
        ctx.fillText("OYUN BİTTİ", c.w/2, c.h/2 - 12);
        ctx.font = "16px Poppins, Arial";
        ctx.fillText(`Skor: ${ui.score} | En İyi: ${ui.high}`, c.w/2, c.h/2 + 16);
      }
      ctx.textAlign = "left";
    }
  };

  // ---------- ÇİZİM ARAÇLARI
  const drawSlingshot = (ctx, s, r) => {
    const a1x = s.x - 12, a1y = s.y;
    const a2x = s.x + 12, a2y = s.y;

    if (s.pulling) {
      ctx.strokeStyle = "#6d4c41"; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(a1x,a1y); ctx.lineTo(s.x + s.pullX, s.y + s.pullY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(a2x,a2y); ctx.lineTo(s.x + s.pullX, s.y + s.pullY); ctx.stroke();
    }

    ctx.fillStyle = "#8d6e63";
    roundRect(ctx, s.x - 8, s.y - 36, 16, 40, 6); ctx.fill();
    ctx.fillStyle = "#6d4c41";
    roundRect(ctx, s.x - 20, s.y - 10, 40, 12, 6); ctx.fill();

    const rx = r.flying ? r.x : (s.pulling ? s.x + s.pullX : s.x);
    const ry = r.flying ? r.y : (s.pulling ? s.y + s.pullY : s.y);
    ctx.fillStyle = "#455a64";
    ctx.beginPath(); ctx.arc(rx, ry, CFG.rockRadius, 0, Math.PI*2); ctx.fill();
  };

  const drawPlatforms = (ctx, w, h) => {
    ctx.fillStyle = "#78909c";
    const baseY = h*0.78;
    drawPlatform(ctx, w*0.55, baseY, 120, 12);
    drawPlatform(ctx, w*0.72, baseY - 44, 130, 12);
    drawPlatform(ctx, w*0.85, baseY - 88, 110, 12);
  };

  const drawPlatform = (ctx, x, y, width, height) => {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 8;
    roundRect(ctx, x - width/2, y - height/2, width, height, 6);
    ctx.fillStyle = "#90a4ae"; ctx.fill();
    ctx.restore();
  };

  const drawBlock = (ctx, b) => {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 10;
    roundRect(ctx, b.x - b.w/2, b.y - b.h/2, b.w, b.h, 8);
    ctx.fillStyle = b.good ? "#fff59d" : "#bbdefb";
    ctx.fill();
    ctx.restore();

    ctx.font = "bold 14px Poppins, Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (b.good) { ctx.strokeStyle = "rgba(255,215,0,.85)"; ctx.lineWidth = 2; ctx.strokeText(b.text, b.x, b.y); }
    ctx.fillStyle = "#263238";
    ctx.fillText(b.text, b.x, b.y);
  };

  const drawCloud = (ctx, x, y, w, h) => {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.ellipse(x, y, w*0.35, h*0.6, 0, 0, Math.PI*2);
    ctx.ellipse(x + w*0.35, y-6, w*0.28, h*0.55, 0, 0, Math.PI*2);
    ctx.ellipse(x + w*0.7, y, w*0.36, h*0.62, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  };

  const drawHeart = (ctx, x, y, s) => {
    ctx.save(); ctx.fillStyle = "#ef5350"; ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - s, y - s, x - 2*s, y + s, x, y + 2*s);
    ctx.bezierCurveTo(x + 2*s, y + s, x + s, y - s, x, y);
    ctx.fill(); ctx.restore();
  };

  const roundRect = (ctx, x, y, w, h, r=8) => {
    ctx.beginPath(); ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  };

  // ---------- LEVEL / UTILS
  function makeLevel(target, pool, widthPx){
    const layout = [];
    const approxH = g.current.h || Math.floor((widthPx || 900) * 0.56);
    const centers = [0.55, 0.72, 0.85].map(v => v * (widthPx || 900));
    const heights = [0, 44, 88];

    let wordsBag = [];
    for (let i=0;i<CFG.targetCount;i++){
      const good = i < Math.round(CFG.targetCount * CFG.goodRatio);
      const text = good ? target : pickDifferent(pool, target);
      wordsBag.push({ good, text });
    }
    for (let i=wordsBag.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [wordsBag[i], wordsBag[j]]=[wordsBag[j], wordsBag[i]]; }

    let idx = 0;
    centers.forEach((cx, k) => {
      const baseY = approxH*0.78 - heights[k];
      const rows = 2;
      for (let r=0;r<rows;r++){
        const y = baseY - r*38 - 26;
        const cols = 2;
        for (let c=0;c<cols;c++){
          if (idx >= wordsBag.length) return;
          const x = cx + (c===0?-24:24);
          const it = wordsBag[idx++];
          layout.push({ x, y, w: 60, h: 34, text: it.text, good: it.good, dead:false, vx:0, vy:0 });
        }
      }
    });
    return layout;
  }

  const spawnConfetti = (arr, x, y, color) => {
    for (let i=0;i<16;i++){
      arr.push({ x, y, vx: (Math.random()*2-1)*2.6, vy: (Math.random()*-2.6), life: 700 + Math.random()*300, col: color });
    }
  };

  const circleRect = (cx,cy,cr, rx,ry,rw,rh) => {
    const nearestX = clamp(cx, rx, rx+rw);
    const nearestY = clamp(cy, ry, ry+rh);
    const dx = cx - nearestX, dy = cy - nearestY;
    return dx*dx + dy*dy <= cr*cr;
  };

  // helpers
  function pick(arr){ return arr[(Math.random()*arr.length)|0]; }
  function pickDifferent(arr, notThis){ if (arr.length <= 1) return notThis; let w = notThis; while (w === notThis) w = pick(arr); return w; }
  const clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
  const dist = (x1,y1,x2,y2)=> Math.hypot(x1-x2, y1-y2);
  const makeClouds = () =>
    Array.from({length:4}).map(() => ({
      x: Math.random()*400,
      y: 20 + Math.random()*90,
      w: 90 + Math.random()*80,
      h: 26 + Math.random()*14,
      s: 0.18 + Math.random()*0.22
    }));

  // ---------- UI helpers
  const toggleMute = () => {
    const next = !ui.muted;
    localStorage.setItem(MUTE3_KEY, next ? "1" : "0");
    setUi(u => ({ ...u, muted: next }));
  };

  return (
    <div className="gd3-wrap">
      <div className="gd3-header">
        <button className="gd3-btn" onClick={() => navigate("/panel")}>🚪 Çık</button>

        {ui.state === "menu" && <button className="gd3-btn primary" onClick={start}>▶️ Başlat</button>}
        {ui.state === "gameover" && <button className="gd3-btn primary" onClick={start}>🔁 Tekrar Oyna</button>}

        <button className="gd3-btn" onClick={toggleMute}>{ui.muted ? "🔇" : "🔊"}</button>
      </div>

      {ui.state !== "menu" && (
        <div className="gd3-target">
          <span className="gd3-chip">HEDEF</span>
          <span className="gd3-word">{ui.target}</span>
          <button className="gd3-say" onClick={sayTarget} title="Oku">🔊</button>
          <div className="gd3-stats">
            <span>Skor: <b>{ui.score}</b></span>
            <span>En İyi: <b>{ui.high}</b></span>
            <span>Süre: <b>{ui.timeLeft}s</b></span>
            <span>♥ {ui.lives}</span>
          </div>
        </div>
      )}

      <div className="gd3-canvas-holder" onClick={() => { if (ui.state === "menu") start(); }}>
        <canvas ref={canvasRef} className="gd3-canvas"/>
      </div>

      {ui.state === "gameover" && (
        <div className="gd3-footer">
          <div className="gd3-info">Skor: {ui.score} — En İyi: {ui.high}</div>
          <div className="gd3-row">
            <button className="gd3-btn primary" onClick={start}>🔁 Tekrar Oyna</button>
            <button className="gd3-btn" onClick={() => navigate("/panel")}>Panele Dön</button>
          </div>
        </div>
      )}
    </div>
  );
}
