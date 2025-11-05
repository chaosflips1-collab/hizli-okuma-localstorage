import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameDay2.css";

const HIGH2_KEY = "gd2_fishing_high";
const MUTE2_KEY = "gd2_fishing_mute";

const defaultWords = [
  "learn","dream","time","happy","play","read","think","focus","smart","answer",
  "book","write","speak","draw","count","music","light","green","blue","quick"
];

const CFG = {
  duration: 45,
  lives: 5,
  spawnEveryMs: 950,          // balık çıkış sıklığı
  goodProb: 0.6,              // hedef balık olma olasılığı
  fishMinSpeed: 0.9,
  fishMaxSpeed: 1.8,
  hookDownSpeed: 4.6,
  hookUpSpeed: 5.4,
  hookHitRadius: 18,
  penaltyInvulMs: 1200,
};

export default function GameDay2({ words = defaultWords }) {
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const audioCtxRef = useRef(null);

  const [ui, setUi] = useState({
    state: "menu",             // menu | playing | gameover
    muted: localStorage.getItem(MUTE2_KEY) === "1",
    score: 0,
    high: Number(localStorage.getItem(HIGH2_KEY) || 0),
    lives: CFG.lives,
    timeLeft: CFG.duration,
    target: pick(words),
  });

  const g = useRef({
    w: 0, h: 0,
    waterTop: 0,
    boatX: 0,
    moveDir: 0,                // -1, 0, 1
    fish: [],                  // {x,y,dir,speed,text,good,waveT}
    bubbles: [],               // {x,y,vx,vy,life}
    splashes: [],              // {x,y,life}
    spawnTimer: 0,
    lastPenaltyAt: -9999,
    clouds: [],
    // oltu
    hook: { state: "idle", x: 0, y: 0, vy: 0, attached: null }, // attached: caught fish index data
  });

  // ---------- SES
  const beep = (f=880, ms=90, type="sine") => {
    if (ui.muted) return;
    try {
      if (!audioCtxRef.current) {
        // eslint-disable-next-line no-undef
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

  const speakTarget = () => {
    try {
      const u = new SpeechSynthesisUtterance(ui.target);
      u.lang = "en-US";
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch {}
  };

  // ---------- KONTROLLER (klavye)
  useEffect(() => {
    const down = (e) => {
      if (ui.state === "menu" && (e.key === "Enter" || e.key === " ")) { start(); return; }
      if (ui.state !== "playing") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") g.current.moveDir = -1;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") g.current.moveDir = 1;
      if (e.key === " " || e.key === "Enter") castOrRetract();
    };
    const up = (e) => {
      if (["ArrowLeft","ArrowRight","a","A","d","D"].includes(e.key)) g.current.moveDir = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.state]);

  // ---------- DOKUNMATİK (ekranı 3 bölge)
  useEffect(() => {
    const holder = canvasRef.current?.parentElement;
    if (!holder) return;
    const onStart = (ev) => {
      if (ui.state === "menu") { start(); return; }
      const x = ("touches" in ev ? ev.touches[0].clientX : ev.clientX);
      const r = holder.getBoundingClientRect();
      const left = r.left + r.width/3, right = r.left + r.width*2/3;
      if (x < left) g.current.moveDir = -1;
      else if (x > right) g.current.moveDir = 1;
      else castOrRetract();
    };
    const onEnd = () => { g.current.moveDir = 0; };
    holder.addEventListener("mousedown", onStart);
    holder.addEventListener("mouseup", onEnd);
    holder.addEventListener("mouseleave", onEnd);
    holder.addEventListener("touchstart", onStart, { passive:true });
    holder.addEventListener("touchend", onEnd);
    return () => {
      holder.removeEventListener("mousedown", onStart);
      holder.removeEventListener("mouseup", onEnd);
      holder.removeEventListener("mouseleave", onEnd);
      holder.removeEventListener("touchstart", onStart);
      holder.removeEventListener("touchend", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.state]);

  // Alt kontrol butonları (mobil-visible)
  const onHoldLeft = (pressed) => { g.current.moveDir = pressed ? -1 : 0; };
  const onHoldRight = (pressed) => { g.current.moveDir = pressed ? 1 : 0; };

  // ---------- OLTU
  const castOrRetract = () => {
    const c = g.current;
    if (ui.state !== "playing") return;
    if (c.hook.state === "idle") {
      // aşağı
      c.hook.state = "down"; c.hook.vy = CFG.hookDownSpeed;
      beep(740, 80, "triangle");
    } else if (c.hook.state === "down") {
      // yukarı
      c.hook.state = "up"; c.hook.vy = -CFG.hookUpSpeed;
      beep(640, 70, "triangle");
    } else if (c.hook.state === "up") {
      // ipi topla — idle
      c.hook.state = "idle"; c.hook.vy = 0; c.hook.attached = null;
    } else if (c.hook.state === "locked") {
      // yakalanmışsa hızlı çek
      c.hook.vy = -CFG.hookUpSpeed * 1.2;
    }
  };

  // ---------- BAŞLAT / BİTİR
  const start = () => {
    const c = g.current;
    c.fish = [];
    c.bubbles = [];
    c.splashes = [];
    c.spawnTimer = 0;
    c.lastPenaltyAt = -9999;
    c.clouds = makeClouds();

    setUi(u => ({
      ...u,
      state: "playing",
      score: 0,
      lives: CFG.lives,
      timeLeft: CFG.duration,
      target: pick(words),
    }));
  };

  const end = (finalScore) => {
    const high = Math.max(ui.high, finalScore);
    localStorage.setItem(HIGH2_KEY, String(high));
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
      const h = Math.min(560, Math.max(380, Math.floor(w * 0.56)));
      canvas.width = Math.floor(w*dpr);
      canvas.height = Math.floor(h*dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);

      const c = g.current;
      c.w = w; c.h = h;
      c.waterTop = h * 0.38;
      c.boatX = w/2;
      c.hook.x = c.boatX; c.hook.y = c.waterTop; c.hook.state = "idle"; c.hook.vy = 0; c.hook.attached = null;
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

  // ---------- ÇİZ & GÜNCELLE
  const draw = (ctx, dt) => {
    const c = g.current;

    // gökyüzü
    const sky = ctx.createLinearGradient(0,0,0,c.h);
    sky.addColorStop(0,"#a3d7ff");
    sky.addColorStop(1,"#e8f4ff");
    ctx.fillStyle = sky; ctx.fillRect(0,0,c.w,c.h);

    // bulutlar
    for (const cl of c.clouds) { drawCloud(ctx, cl.x, cl.y, cl.w, cl.h); cl.x += cl.s; if (cl.x > c.w + 80) { cl.x = -80; cl.y = 20 + Math.random()*90; } }

    // su
    const water = ctx.createLinearGradient(0,c.waterTop,0,c.h);
    water.addColorStop(0,"#b2ebf2");
    water.addColorStop(1,"#7fd3e0");
    ctx.fillStyle = water; ctx.fillRect(0, c.waterTop, c.w, c.h - c.waterTop);

    // ufuk ve dalga halkaları
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    for (let i=0;i<4;i++){
      ctx.beginPath();
      ctx.ellipse(c.w/2, c.h*0.92, c.w*0.55 - i*70, c.h*0.14 - i*12, 0, 0, Math.PI*2);
      ctx.stroke();
    }

    // tekne x’i (hareket)
    c.boatX += (c.moveDir * 5.2);
    c.boatX = Math.max(40, Math.min(c.w - 40, c.boatX));

    // balık spawn
    c.spawnTimer -= dt;
    if (ui.state==="playing" && c.spawnTimer <= 0) {
      c.spawnTimer = CFG.spawnEveryMs - Math.min(450, (CFG.spawnEveryMs-300) * (1 - ui.timeLeft / CFG.duration));
      const dir = Math.random() < 0.5 ? 1 : -1;
      const y = c.waterTop + 26 + Math.random() * (c.h*0.48);
      const x = dir > 0 ? -50 : c.w + 50;
      const speed = rand(CFG.fishMinSpeed, CFG.fishMaxSpeed) * dir;
      const good = Math.random() < CFG.goodProb;
      const text = good ? ui.target : pickDifferent(words, ui.target);
      c.fish.push({ x, y, dir, speed, text, good, waveT: Math.random()*Math.PI*2 });
    }

    // balıkları güncelle & çiz
    for (const f of c.fish) {
      f.x += f.speed;
      f.waveT += 0.08;
      const bob = Math.sin(f.waveT) * 0.6;
      drawFish(ctx, f.x, f.y + bob, f.dir, f.good, f.text);
      // kabarcık
      if (Math.random() < 0.05) c.bubbles.push({ x: f.x + (Math.random()*10-5), y: f.y + 8, vx: (Math.random()-0.5)*0.2, vy: -0.6 - Math.random()*0.3, life: 900 });
    }
    c.fish = c.fish.filter(f => f.x > -80 && f.x < c.w + 80);

    // kabarcıklar
    for (const b of c.bubbles) {
      b.x += b.vx; b.y += b.vy; b.life -= dt;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, Math.PI*2); ctx.fill();
    }
    c.bubbles = c.bubbles.filter(b => b.life > 0);

    // sıçrama efektleri
    for (const s of c.splashes) {
      s.life -= dt;
      const alpha = Math.max(0, s.life / 400);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, (400-s.life)/12, 0, Math.PI, true); ctx.stroke();
    }
    c.splashes = c.splashes.filter(s => s.life > 0);

    // olta mantığı
    c.hook.x = c.boatX;
    if (c.hook.state === "down") {
      c.hook.y += c.hook.vy;
      if (c.hook.y > c.h - 20) { c.hook.state = "up"; c.hook.vy = -CFG.hookUpSpeed; }
    } else if (c.hook.state === "up" || c.hook.state === "locked") {
      c.hook.y += c.hook.vy;
      if (c.hook.y <= c.waterTop) {
        // yüzeye çıktı
        if (c.hook.attached) {
          // yakalanan hedefe göre puan/can
          const wasGood = c.hook.attached.good;
          if (wasGood) {
            setUi(u => ({ ...u, score: u.score + 10, target: pick(words) }));
            beep(980, 110, "sine");
          } else {
            const now = performance.now();
            if (now - c.lastPenaltyAt > CFG.penaltyInvulMs) {
              c.lastPenaltyAt = now;
              beep(260, 120, "square");
              setUi(u => {
                const lives = u.lives - 1;
                if (lives <= 0) end(u.score);
                return { ...u, lives };
              });
            }
          }
        }
        c.hook.state = "idle"; c.hook.vy = 0; c.hook.attached = null;
        c.catched = null;
        c.splashes.push({ x: c.boatX, y: c.waterTop, life: 400 });
      }
    } else {
      // idle
      c.hook.y = c.waterTop;
    }

    // olta çizgisi ve kanca
    drawBoat(ctx, c.boatX, c.waterTop);
    ctx.strokeStyle = "rgba(30,30,30,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(c.boatX, c.waterTop - 16); ctx.lineTo(c.hook.x, c.hook.y); ctx.stroke();

    // kanca
    ctx.fillStyle = "#0d47a1";
    ctx.beginPath(); ctx.arc(c.hook.x, c.hook.y, 5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#0d47a1"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.hook.x + 6, c.hook.y + 2, 6, Math.PI*0.6, Math.PI*1.6); ctx.stroke();

    // kanca çarpışması (yalnızca suyun altında)
    if (c.hook.state === "down" || c.hook.state === "up") {
      for (let i = c.fish.length - 1; i >= 0; i--) {
        const f = c.fish[i];
        if (dist2(f.x, f.y, c.hook.x, c.hook.y) < CFG.hookHitRadius*CFG.hookHitRadius) {
          // yakala
          c.hook.state = "locked"; c.hook.vy = -CFG.hookUpSpeed * 1.15; c.hook.attached = f;
          c.fish.splice(i,1);
          beep(820, 90, "triangle");
          break;
        }
      }
    }

    // HUD (sol üst)
    ctx.fillStyle = "#0d47a1";
    ctx.font = "bold 16px Poppins, Arial";
    ctx.fillText(`SCORE ${ui.score}`, 12, 24);
    ctx.fillText(`HIGH ${ui.high}`, 12, 46);
    ctx.fillText(`TIME ${ui.timeLeft}s`, 12, 68);
    for (let i=0;i<ui.lives;i++) drawHeart(ctx, c.w - 20 - i*24, 24, 8);

    // overlay (menu / gameover)
    if (ui.state !== "playing") {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0,0,c.w,c.h);
      ctx.fillStyle = "white"; ctx.textAlign = "center";
      if (ui.state === "menu") {
        ctx.font = "bold 22px Poppins, Arial";
        ctx.fillText("GameDay2 — Kelime Balıkçısı", c.w/2, c.h/2 - 12);
        ctx.font = "16px Poppins, Arial";
        ctx.fillText("←/→ Tekne hareketi • Orta dokun/Boşluk: Oltayı at/çek", c.w/2, c.h/2 + 16);
        ctx.fillText("Başlamak için dokun/ENTER", c.w/2, c.h/2 + 38);
      } else if (ui.state === "gameover") {
        ctx.font = "bold 22px Poppins, Arial";
        ctx.fillText("OYUN BİTTİ", c.w/2, c.h/2 - 12);
        ctx.font = "16px Poppins, Arial";
        ctx.fillText(`Skor: ${ui.score}  |  En İyi: ${ui.high}`, c.w/2, c.h/2 + 16);
      }
      ctx.textAlign = "left";
    }
  };

  // ---------- ÇİZİM YARDIMCILARI
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

  const drawBoat = (ctx, x, waterTop) => {
    // gölge
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath(); ctx.ellipse(x, waterTop + 14, 40, 8, 0, 0, Math.PI*2); ctx.fill();

    // tekne
    ctx.fillStyle = "#1976d2";
    roundRect(ctx, x-28, waterTop-18, 56, 22, 8); ctx.fill();
    ctx.fillStyle = "#1565c0"; roundRect(ctx, x-42, waterTop-8, 84, 14, 8); ctx.fill();

    // direk (olta üst bağlantı)
    ctx.fillStyle = "#0d47a1"; ctx.fillRect(x-2, waterTop-22, 4, 10);
  };

  const drawFish = (ctx, x, y, dir, good, text) => {
    // gölge
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    ctx.beginPath(); ctx.ellipse(x, y+6, 16, 6, 0, 0, Math.PI*2); ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    if (dir < 0) ctx.scale(-1, 1);

    // gövde
    ctx.fillStyle = good ? "#ffeb3b" : "#b3e5fc";
    ctx.strokeStyle = good ? "#fbc02d" : "#81d4fa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // kuyruk
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-28, -6);
    ctx.lineTo(-28, 6);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // göz
    ctx.fillStyle = "#263238";
    ctx.beginPath(); ctx.arc(8, -2, 2, 0, Math.PI*2); ctx.fill();

    ctx.restore();

    // kelime etiketi
    const f = 12;
    ctx.font = `bold ${f}px Poppins, Arial`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (good) { ctx.strokeStyle = "rgba(255,215,0,0.9)"; ctx.lineWidth = 2; ctx.strokeText(text, x, y - 16); }
    ctx.fillStyle = "#263238";
    ctx.fillText(text, x, y - 16);
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

  // ---------- YARDIMCILAR
  const makeClouds = () =>
    Array.from({ length: 4 }).map(() => ({
      x: Math.random()*400,
      y: 20 + Math.random()*90,
      w: 90 + Math.random()*80,
      h: 26 + Math.random()*14,
      s: 0.18 + Math.random()*0.22
    }));

  const rand = (a, b) => a + Math.random()*(b-a);
  const dist2 = (ax,ay,bx,by) => { const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; };
  function pick(arr){ return arr[(Math.random()*arr.length)|0]; }
  function pickDifferent(arr, notThis){
    if (arr.length <= 1) return notThis;
    let w = notThis; while (w === notThis) w = pick(arr); return w;
  }

  // ---------- UI helpers
  const toggleMute = () => {
    const next = !ui.muted;
    localStorage.setItem(MUTE2_KEY, next ? "1" : "0");
    setUi(u => ({ ...u, muted: next }));
  };

  return (
    <div className="gd2-wrap">
      <div className="gd2-header">
        <button className="gd2-btn" onClick={() => navigate("/panel")}>🚪 Çık</button>

        {ui.state === "menu" && <button className="gd2-btn primary" onClick={start}>▶️ Başlat</button>}
        {ui.state === "gameover" && <button className="gd2-btn primary" onClick={start}>🔁 Tekrar Oyna</button>}

        <button className="gd2-btn" onClick={toggleMute}>{ui.muted ? "🔇" : "🔊"}</button>
      </div>

      {/* HEDEF banner + mini istatistik */}
      {ui.state !== "menu" && (
        <div className="gd2-target">
          <span className="gd2-chip">HEDEF</span>
          <span className="gd2-word">{ui.target}</span>
          <button className="gd2-say" onClick={speakTarget} title="Oku">🔊</button>
          <div className="gd2-stats">
            <span>Skor: <b>{ui.score}</b></span>
            <span>En İyi: <b>{ui.high}</b></span>
            <span>Süre: <b>{ui.timeLeft}s</b></span>
            <span>♥ {ui.lives}</span>
          </div>
        </div>
      )}

      <div className="gd2-canvas-holder" onClick={() => { if (ui.state === "menu") start(); }}>
        <canvas ref={canvasRef} className="gd2-canvas" />
      </div>

      {/* Mobil kontrol butonları */}
      {ui.state === "playing" && (
        <div className="gd2-mobile-ctrls">
          <button
            className="gd2-ctrl"
            onMouseDown={() => onHoldLeft(true)}
            onMouseUp={() => onHoldLeft(false)}
            onMouseLeave={() => onHoldLeft(false)}
            onTouchStart={() => onHoldLeft(true)}
            onTouchEnd={() => onHoldLeft(false)}
          >
            ←
          </button>
          <button className="gd2-ctrl primary" onClick={castOrRetract}>OLTA</button>
          <button
            className="gd2-ctrl"
            onMouseDown={() => onHoldRight(true)}
            onMouseUp={() => onHoldRight(false)}
            onMouseLeave={() => onHoldRight(false)}
            onTouchStart={() => onHoldRight(true)}
            onTouchEnd={() => onHoldRight(false)}
          >
            →
          </button>
        </div>
      )}

      {ui.state === "gameover" && (
        <div className="gd2-footer">
          <div className="gd2-info">Skor: {ui.score} — En İyi: {ui.high}</div>
          <div className="gd2-row">
            <button className="gd2-btn primary" onClick={start}>🔁 Tekrar Oyna</button>
            <button className="gd2-btn" onClick={() => navigate("/panel")}>Panele Dön</button>
          </div>
        </div>
      )}
    </div>
  );
}
