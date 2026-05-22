import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faHouse } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/useAuth";

const NotFound = () => {
  const { user } = useAuth();

  return (
    <div className="flux">
      <Header />

      <div className="not-found-page">
        <div className="not-found-card">
          <div className="not-found-code">404</div>
          <h1>Page introuvable</h1>
          <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
          <div className="not-found-actions">
            <Link to="/" className="btn-primary">
              <FontAwesomeIcon icon={faHouse} />
              Retour à l'accueil
            </Link>
            {user && (
              <Link to="/dashboard" className="btn-secondary">
                Mon dashboard
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
