import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import API_URL from "../config";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succès, setSuccès] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    if (password.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirm) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nouveauMotDePasse: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccès(true);
      setTimeout(() => navigate("/connect"), 3000);
    } catch (err) {
      setErreur(err.message || "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flux">
        <Header />
        <div className="auth-page">
          <div className="auth-card">
            <div className="alert-error">
              Lien invalide. Faites une nouvelle demande de réinitialisation.
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flux">
      <Header />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/logo.webp" alt="logo" className="auth-logo" />
            <h2>Nouveau mot de passe</h2>
            <p className="auth-subtitle">
              Choisissez un nouveau mot de passe sécurisé
            </p>
          </div>

          {succès ? (
            <div className="forgot-success">
              <div className="succes-icon">✅</div>
              <p>Mot de passe réinitialisé avec succès !</p>
              <p className="succes-redirect">
                Redirection vers la connexion dans quelques secondes...
              </p>
            </div>
          ) : (
            <>
              {erreur && <div className="alert-error">{erreur}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-field">
                  <label>Nouveau mot de passe</label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      className="field"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="show-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                      />
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>Confirmer le mot de passe</label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      className="field"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="button-submit">
                  <button type="submit" disabled={loading}>
                    {loading
                      ? "Réinitialisation..."
                      : "Réinitialiser le mot de passe"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
