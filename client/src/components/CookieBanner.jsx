import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCookie, faCheck, faShield } from "@fortawesome/free-solid-svg-icons";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // toujours actif
    functional: false, // localStorage, thème, préférences
    analytics: false, // futur usage
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Affiche la bannière après 500ms
      setTimeout(() => setVisible(true), 500);
    }
  }, []);

  const saveConsent = (prefs) => {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({
        ...prefs,
        date: new Date().toISOString(),
      }),
    );
    setVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, functional: true, analytics: true });
  };

  const handleRejectAll = () => {
    saveConsent({ essential: true, functional: false, analytics: false });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!visible) return null;

  return (
    <div className="cookie-overlay">
      <div className="cookie-banner">
        <div className="cookie-header">
          <div className="cookie-icon">
            <FontAwesomeIcon icon={faCookie} />
          </div>
          <div>
            <h3>Gestion des cookies</h3>
            <p>
              Help Work utilise des cookies pour assurer le bon fonctionnement
              de l'application et améliorer votre expérience.
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="cookie-details">
            <div className="cookie-category">
              <div className="cookie-category-header">
                <div>
                  <strong>Cookies essentiels</strong>
                  <span>Nécessaires au fonctionnement de l'app</span>
                </div>
                <div className="cookie-toggle always-on">
                  <FontAwesomeIcon icon={faShield} />
                  Toujours actif
                </div>
              </div>
              <p>
                Authentification, sécurité, session utilisateur. Ces cookies ne
                peuvent pas être désactivés.
              </p>
            </div>

            <div className="cookie-category">
              <div className="cookie-category-header">
                <div>
                  <strong>Cookies fonctionnels</strong>
                  <span>Préférences et personnalisation</span>
                </div>
                <label className="cookie-toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        functional: e.target.checked,
                      })
                    }
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <p>
                Thème clair/sombre, préférences d'affichage, notifications
                snoozées.
              </p>
            </div>

            <div className="cookie-category">
              <div className="cookie-category-header">
                <div>
                  <strong>Cookies analytiques</strong>
                  <span>Amélioration de l'expérience</span>
                </div>
                <label className="cookie-toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        analytics: e.target.checked,
                      })
                    }
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <p>
                Données anonymes sur l'utilisation de l'application (non
                implémenté actuellement).
              </p>
            </div>
          </div>
        )}

        <div className="cookie-actions">
          <button
            className="cookie-btn details"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Masquer les détails" : "Personnaliser"}
          </button>

          {showDetails ? (
            <button className="cookie-btn save" onClick={handleSavePreferences}>
              <FontAwesomeIcon icon={faCheck} />
              Enregistrer mes choix
            </button>
          ) : (
            <>
              <button className="cookie-btn reject" onClick={handleRejectAll}>
                Refuser
              </button>
              <button className="cookie-btn accept" onClick={handleAcceptAll}>
                <FontAwesomeIcon icon={faCheck} />
                Tout accepter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
