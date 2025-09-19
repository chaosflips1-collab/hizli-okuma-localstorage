import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ Bileşenler
import Login from "./components/Login";           // Öğrenci girişi
import Panel from "./components/Panel";           // Öğrenci paneli
import AdminLogin from "./components/AdminLogin"; // Admin girişi
import AdminPanel from "./components/AdminPanel"; // Admin paneli

// ✅ Egzersizler
import Takistoskop from "./components/Takistoskop";
import Kosesel from "./components/Kosesel";
import Acili from "./components/Acili";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Öğrenci giriş ekranı */}
        <Route path="/" element={<Login />} />

        {/* 🔹 Öğrenci paneli */}
        <Route path="/panel" element={<Panel />} />

        {/* 🔹 Admin giriş ekranı */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* 🔹 Admin paneli */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* 🔹 Egzersizler */}
        <Route path="/takistoskop" element={<Takistoskop />} />
        <Route path="/kosesel" element={<Kosesel />} />
        <Route path="/acili" element={<Acili />} />
      </Routes>
    </Router>
  );
}

export default App;
