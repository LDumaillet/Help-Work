import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderClosed,
  faTable,
  faSquarePollVertical,
  faCircleLeft,
  faCircleRight,
  faCircleUp,
  faCircleDown,
} from "@fortawesome/free-solid-svg-icons";

const MenuLeft = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");

    setIsTablet(mediaQuery.matches);

    const handleChange = (e) => setIsTablet(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const getIcon = () => {
    if (isTablet) {
      return isOpen ? faCircleUp : faCircleDown;
    }
    return isOpen ? faCircleLeft : faCircleRight;
  };

  return (
    <div className="dashboard-layout">
      <div className={`nav-dashboard ${isOpen ? "open" : "closed"}`}>
        <ul>
          <li>
            <img src="/img-user.png" alt="Image de l'utilisateur" />
            <span className="link-text">Pseudo</span>
          </li>
          <li>
            <a href="/dashboard">
              <FontAwesomeIcon icon={faTable} />
              <span className="link-text">Dashboard</span>
            </a>
          </li>
          <li>
            <a href="/cases">
              <FontAwesomeIcon icon={faFolderClosed} />
              <span className="link-text">Dossier</span>
            </a>
          </li>
          <li>
            <a href="/stats">
              <FontAwesomeIcon icon={faSquarePollVertical} />
              <span className="link-text">Statistiques</span>
            </a>
          </li>
        </ul>
      </div>

      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={getIcon()} />
        <span>{isOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
      </button>
    </div>
  );
};

export default MenuLeft;
