import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ Bileşenler
import Login from "./components/Login";          // Öğrenci girişi
import Panel from "./components/Panel";          // Öğrenci paneli
import AdminLogin from "./components/AdminLogin"; // Admin girişi
import AdminPanel from "./components/AdminPanel"; // Admin paneli

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
      </Routes>
    </Router>
  );
}

export default App;
