import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Connect from "./pages/Connect";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Stats from "./pages/Stats";
import PrivateRoute from "./components/PrivateRoute";
import CaseDetail from "./pages/CaseDetail";
import Profile from "./pages/Profile";
import PublicRoute from "./components/PublicRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route
          path="/registration"
          element={
            <PublicRoute>
              <Registration />
            </PublicRoute>
          }
        />
        <Route
          path="/connect"
          element={
            <PublicRoute>
              <Connect />
            </PublicRoute>
          }
        />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <PrivateRoute>
              <Cases />
            </PrivateRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <PrivateRoute>
              <Stats />
            </PrivateRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <PrivateRoute>
              <CaseDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
