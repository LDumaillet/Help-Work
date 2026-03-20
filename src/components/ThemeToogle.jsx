import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon } from "@fortawesome/free-solid-svg-icons";

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
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
