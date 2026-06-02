import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage(data.message);
    } catch (err) {
      setErreur(err.message || "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flux">
      <Header />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/logo.webp" alt="logo" className="auth-logo" />
            <h2>Mot de passe oublié</h2>
            <p className="auth-subtitle">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {message ? (
            <div className="forgot-success">
              <div className="succes-icon">📧</div>
              <p>{message}</p>
              <p className="succes-redirect">
                Vérifiez votre boîte mail et vos spams.
              </p>
              <Link to="/connect" className="btn-primary">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              {erreur && <div className="alert-error">{erreur}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-field">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input
                      className="field"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom.prenom@email.fr"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="button-submit">
                  <button type="submit" disabled={loading}>
                    {loading ? "Envoi en cours..." : "Envoyer le lien"}
                  </button>
                </div>
              </form>

              <p className="auth-redirect">
                <Link to="/connect">
                  <FontAwesomeIcon icon={faArrowLeft} /> Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
