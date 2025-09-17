import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Panel from "./components/Panel";
import Takistoskop from "./components/Takistoskop";
import Kosesel from "./components/Kosesel";
import Acili from "./components/Acili";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="/takistoskop" element={<Takistoskop />} />
        <Route path="/kosesel" element={<Kosesel />} />
        <Route path="/acili" element={<Acili />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
