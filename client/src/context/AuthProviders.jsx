import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

export const AuthProvider = ({ children }) => {
  const getValidToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }
      return token;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  };

  const [token, setToken] = useState(getValidToken);
  const [user, setUser] = useState(() => {
    if (!getValidToken()) return null;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ─── Déclaré AVANT le useEffect ──────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ─── useEffect APRÈS les fonctions ───────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp < Date.now() / 1000) {
          logout();
          window.location.href = "/connect?session=expired";
        }
      } catch {
        logout();
        window.location.href = "/connect?session=expired";
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
