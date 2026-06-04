import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faTable,
  faUserPlus,
  faBars,
  faXmark,
  faRightFromBracket,
  faBell,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import ThemeToogle from "./ThemeToogle";
import { useAuth } from "../context/useAuth";
import { useNotifications } from "../context/useNotifications";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [snoozeMenuId, setSnoozeMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user, logout, token } = useAuth();
  const { notifications, dismissNotification, snoozeFor } = useNotifications();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
        setSnoozeMenuId(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (!searchQuery.trim() || !token) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/dossiers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dossiers = await res.json();
        if (!res.ok) return;

        const query = searchQuery.toLowerCase();
        const filtered = dossiers.filter(
          (d) =>
            d.titre?.toLowerCase().includes(query) ||
            d.client?.toLowerCase().includes(query),
        );
        setSearchResults(filtered.slice(0, 6));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, token]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const handleSelectResult = (dossier) => {
    navigate(`/cases/${dossier._id}`);
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const getStatutLabel = (statut) => {
    const labels = {
      en_cours: "En cours",
      attente: "Attente",
      termine: "Terminé",
      archive: "Archivé",
    };
    return labels[statut] || statut;
  };

  const getNotifColor = (type) => {
    if (type === "danger") return "#e74c3c";
    if (type === "warning") return "var(--warningColor)";
    return "var(--capitalColor)";
  };

  const getNotifIcon = (type) => {
    if (type === "danger") return "🔴";
    if (type === "warning") return "🟠";
    return "🔵";
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-logo">
          <a href="/">
            <img src="/logo.webp" alt="logo du site" />
          </a>
        </div>

        {/* BARRE DE RECHERCHE — visible en permanence sur desktop */}
        {user && (
          <div className="navbar-search" ref={searchRef}>
            <div className={`search-bar ${searchOpen ? "open" : ""}`}>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="search-icon"
              />
              <input
                type="text"
                placeholder="Rechercher un dossier ou un client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            {/* Bouton loupe sur mobile/tablette */}
            <button
              className="search-toggle"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>

            {/* Résultats */}
            {searchQuery && (
              <div className="search-results">
                {searchLoading ? (
                  <div className="search-loading">Recherche...</div>
                ) : searchResults.length === 0 ? (
                  <div className="search-empty">
                    Aucun résultat pour "{searchQuery}"
                  </div>
                ) : (
                  <ul>
                    {searchResults.map((dossier) => (
                      <li
                        key={dossier._id}
                        onClick={() => handleSelectResult(dossier)}
                        className="search-result-item"
                      >
                        <div className="search-result-info">
                          <strong>{dossier.titre}</strong>
                          <span>{dossier.client || "Sans client"}</span>
                        </div>
                        <span className={`status ${dossier.statut}`}>
                          {getStatutLabel(dossier.statut)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
        </button>

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

          {user ? (
            <>
              {/* CLOCHE NOTIFICATIONS */}
              <div className="notif-wrapper" ref={notifRef}>
                <button
                  className="navbar-link notif-btn"
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setSnoozeMenuId(null);
                  }}
                >
                  <FontAwesomeIcon icon={faBell} />
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <span className="notif-badge">{notifications.length}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="notif-panel">
                    <div className="notif-panel-header">
                      <h3>Notifications</h3>
                      <span className="notif-count">
                        {notifications.length} alerte(s)
                      </span>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <p>✅ Aucune alerte en cours</p>
                      </div>
                    ) : (
                      <ul className="notif-list">
                        {notifications.map((notif) => (
                          <li
                            key={notif.id}
                            className="notif-item"
                            style={{
                              borderLeftColor: getNotifColor(notif.type),
                            }}
                          >
                            <div className="notif-clickable">
                              <span className="notif-icon">
                                {getNotifIcon(notif.type)}
                              </span>
                              <div className="notif-content">
                                <strong>{notif.titre}</strong>
                                <span>{notif.message}</span>
                              </div>
                            </div>

                            <div className="notif-actions">
                              <button
                                className="notif-action-btn voir"
                                title="Voir le dossier"
                                onClick={() => {
                                  navigate(`/cases/${notif.dossierId}`);
                                  setNotifOpen(false);
                                  setSnoozeMenuId(null);
                                }}
                              >
                                👁
                              </button>
                              <button
                                className="notif-action-btn dismiss"
                                title="Traité — me rappeler demain si non résolu"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notif.id);
                                  setSnoozeMenuId(null);
                                }}
                              >
                                ✓
                              </button>
                              <button
                                className="notif-action-btn snooze"
                                title="Me rappeler dans..."
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSnoozeMenuId(
                                    snoozeMenuId === notif.id ? null : notif.id,
                                  );
                                }}
                              >
                                🔔
                              </button>
                              {snoozeMenuId === notif.id && (
                                <div
                                  className="snooze-menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <p>Me rappeler dans :</p>
                                  {[1, 2, 3, 7, 14].map((days) => (
                                    <button
                                      key={days}
                                      onClick={() => {
                                        snoozeFor(notif.id, days);
                                        setSnoozeMenuId(null);
                                      }}
                                    >
                                      {days === 1 ? "1 jour" : `${days} jours`}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <a
                className="navbar-link navbar-user"
                href="/profile"
                onClick={() => setMenuOpen(false)}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="navbar-avatar"
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
                <span>{user.nom}</span>
              </a>

              <button
                className="navbar-link navbar-logout"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
