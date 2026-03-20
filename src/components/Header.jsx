import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faTable,
  faUserPlus,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ThemeToogle from "./ThemeToogle";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Ferme le menu si on redimensionne au-dessus de 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/">
          <img src="/logo.webp" alt="logo du site" />
        </a>
      </div>

      <button
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
      </button>

      {/* Overlay pour fermer le menu en cliquant dehors */}
      {menuOpen && (
        <div className="navbar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <a
          className="navbar-link"
          href="/dashboard"
          onClick={() => setMenuOpen(false)}
        >
          <FontAwesomeIcon icon={faTable} />
          <span>Dashboard</span>
        </a>

        <ThemeToogle />

        <a
          className="navbar-link"
          href="/registration"
          onClick={() => setMenuOpen(false)}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          <span>Inscription</span>
        </a>

        <a
          className="navbar-link"
          href="/connect"
          onClick={() => setMenuOpen(false)}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Connexion</span>
        </a>
      </div>
    </nav>
  );
};

export default Header;
