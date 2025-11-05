import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ✅ Sayfalar
import Login from "./components/Login";
import Panel from "./components/Panel";
import Kategori from "./components/Kategori";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import AddStudent from "./components/AddStudent";

// ✅ Egzersizler
import Takistoskop from "./components/Takistoskop";
import Kosesel from "./components/Kosesel";
import Acili from "./components/Acili";
import Cifttarafliodak from "./components/Cifttarafliodak";
import Harfbulmaodakcalismasi from "./components/Harfbulmaodakcalismasi";
import Odaklanma from "./components/Odaklanma";
import Hafizagelistirmecalismasi from "./components/Hafizagelistirmecalismasi";
import Gozoyunu from "./components/Gozoyunu";
import Buyuyensekil from "./components/Buyuyensekil";
import Genisleyenkutular from "./components/Genisleyenkutular";
import HizliOkuma from "./components/HizliOkuma";
import BlokOkuma from "./components/BlokOkuma";

// ✅ Mini Oyunlar
import GameDay1 from "./components/GameDay1";
import GameDay2 from "./components/GameDay2";
import GameDay3 from "./components/GameDay3";

// 🔐 Öğrenci için özel route (JSON.parse korumalı)
function PrivateRoute({ element }) {
  const raw = localStorage.getItem("activeStudent");
  if (!raw) return <Navigate to="/" />;

  let student = null;
  try {
    student = JSON.parse(raw);
  } catch {
    // bozuk kayıt varsa temizle ve girişe dön
    localStorage.removeItem("activeStudent");
    return <Navigate to="/" />;
  }

  // 🎮 sadece 1234 kodlu öğrenci (test hesabı) oyunlara erişebilir
  const isTester = student.kod?.trim() === "1234";

  // 🧱 Eğer mini oyun rotasına gidiyorsa ve test öğrenci değilse yönlendir
  if (window.location.pathname.startsWith("/gameday") && !isTester) {
    alert("🚫 Bu oyun yalnızca test hesabına (1234) açıktır.");
    return <Navigate to="/panel" replace />;
  }

  return element;
}

// 🔐 Admin için özel route
function AdminPrivateRoute({ element }) {
  const adminAuth = localStorage.getItem("adminAuth");
  return adminAuth ? element : <Navigate to="/admin" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Giriş / Panel */}
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<PrivateRoute element={<Panel />} />} />
        <Route path="/kategori/:id" element={<PrivateRoute element={<Kategori />} />} />

        {/* 🔹 Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/panel" element={<AdminPrivateRoute element={<AdminPanel />} />} />

        {/* 🔹 Egzersizler */}
        <Route path="/takistoskop" element={<PrivateRoute element={<Takistoskop />} />} />
        <Route path="/kosesel" element={<PrivateRoute element={<Kosesel />} />} />
        <Route path="/acili" element={<PrivateRoute element={<Acili />} />} />
        <Route path="/cifttarafliodak" element={<PrivateRoute element={<Cifttarafliodak />} />} />
        <Route path="/harfbulmaodakcalismasi" element={<PrivateRoute element={<Harfbulmaodakcalismasi />} />} />
        <Route path="/odaklanma" element={<PrivateRoute element={<Odaklanma />} />} />
        <Route path="/hafizagelistirmecalismasi" element={<PrivateRoute element={<Hafizagelistirmecalismasi />} />} />
        <Route path="/gozoyunu" element={<PrivateRoute element={<Gozoyunu />} />} />
        <Route path="/buyuyensekil" element={<PrivateRoute element={<Buyuyensekil />} />} />
        <Route path="/genisleyenkutular" element={<PrivateRoute element={<Genisleyenkutular />} />} />
        <Route path="/hizliokuma" element={<PrivateRoute element={<HizliOkuma />} />} />
        <Route path="/blokokuma" element={<PrivateRoute element={<BlokOkuma />} />} />

        {/* 🎮 Mini Oyunlar */}
        <Route path="/gameday1" element={<PrivateRoute element={<GameDay1 />} />} />
        <Route path="/gameday2" element={<PrivateRoute element={<GameDay2 />} />} />
        <Route path="/gameday3" element={<PrivateRoute element={<GameDay3 />} />} />

        {/* 🔹 Diğer */}
        <Route path="/addstudent" element={<AddStudent />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
