// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ✅ Sayfalar
import Login from "./components/Login";
import Panel from "./components/Panel";
import Kategori from "./components/Kategori";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";

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

// 🔐 Öğrenci için özel route
function PrivateRoute({ element }) {
  const student = localStorage.getItem("activeStudent");
  return student ? element : <Navigate to="/" />;
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
        {/* Öğrenci */}
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<PrivateRoute element={<Panel />} />} />
        <Route path="/kategori/:id" element={<PrivateRoute element={<Kategori />} />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/adminpanel" element={<AdminPrivateRoute element={<AdminPanel />} />} />

        {/* Egzersizler */}
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
      </Routes>
    </Router>
  );
}

export default App;
