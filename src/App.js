import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ Bileşenler
import Login from "./components/Login";
import Panel from "./components/Panel";
import Kategori from "./components/Kategori"; // 🔹 yeni eklendi
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/kategori/:id" element={<Kategori />} /> {/* 🔹 yeni */}

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />

        {/* Egzersizler */}
        <Route path="/takistoskop" element={<Takistoskop />} />
        <Route path="/kosesel" element={<Kosesel />} />
        <Route path="/acili" element={<Acili />} />
        <Route path="/cifttarafliodak" element={<Cifttarafliodak />} />
        <Route path="/harfbulmaodakcalismasi" element={<Harfbulmaodakcalismasi />} />
        <Route path="/odaklanma" element={<Odaklanma />} />
        <Route path="/hafizagelistirmecalismasi" element={<Hafizagelistirmecalismasi />} />
        <Route path="/gozoyunu" element={<Gozoyunu />} />
        <Route path="/buyuyensekil" element={<Buyuyensekil />} />
        <Route path="/genisleyenkutular" element={<Genisleyenkutular />} />
        <Route path="/hizliokuma" element={<HizliOkuma />} />
        <Route path="/blokokuma" element={<BlokOkuma />} />
      </Routes>
    </Router>
  );
}

export default App;
