import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Connect from "./pages/Connect";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Stats from "./pages/Stats";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
