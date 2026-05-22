import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon } from "@fortawesome/free-solid-svg-icons";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      className="navbar-link"
      onClick={toggleTheme}
      aria-pressed={theme === "dark"}
      aria-label="Changer le thème"
    >
      <FontAwesomeIcon icon={faMoon} />
      <span>Mode</span>
    </button>
  );
};

export default ThemeToggle;
