import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ Bileşenler
import Login from "./components/Login";
import Panel from "./components/Panel";
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
import Genisleyenkutular from "./components/Genisleyenkutular"; // ✅ Yeni eklendi
import Egzersiz11 from "./components/Egzersiz11";
import Egzersiz12 from "./components/Egzersiz12";
import Egzersiz13 from "./components/Egzersiz13";
import Egzersiz14 from "./components/Egzersiz14";

function App() {
  return (
    <Router>
      <Routes>
        {/* Öğrenci giriş ekranı */}
        <Route path="/" element={<Login />} />

        {/* Öğrenci paneli */}
        <Route path="/panel" element={<Panel />} />

        {/* Admin giriş ekranı */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin paneli */}
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
        <Route path="/genisleyenkutular" element={<Genisleyenkutular />} /> {/* ✅ Yeni rota */}
        <Route path="/egzersiz11" element={<Egzersiz11 />} />
        <Route path="/egzersiz12" element={<Egzersiz12 />} />
        <Route path="/egzersiz13" element={<Egzersiz13 />} />
        <Route path="/egzersiz14" element={<Egzersiz14 />} />
      </Routes>
    </Router>
  );
}

export default App;
