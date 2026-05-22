import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import Footer from "../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useSearchParams } from "react-router-dom";

const Connect = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          motDePasse: data.password,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.message || "Email ou mot de passe incorrect.");
        return;
      }
      login(result.user, result.token);
      navigate("/dashboard");
    } catch {
      setServerError("Erreur serveur, réessaie plus tard.");
    }
  };

  return (
    <div className="flux">
      <Header />

      <div className="auth-page">
        <div className="auth-card">
          {sessionExpired && (
            <div className="session-expired">
              <span>🔒</span>
              <p>Votre session a expiré. Veuillez vous reconnecter.</p>
            </div>
          )}

          {/* Logo + titre */}
          <div className="auth-header">
            <img src="/logo.webp" alt="logo" className="auth-logo" />
            <h2>Connexion</h2>
            <p className="auth-subtitle">Accédez à votre espace de travail</p>
          </div>

          {serverError && <div className="alert-error">{serverError}</div>}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="auth-form"
          >
            {/* Email */}
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  autoFocus
                  {...register("email", {
                    required: "L'email est obligatoire",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Format d'email invalide",
                    },
                  })}
                  aria-invalid={errors.email ? "true" : "false"}
                  className={`field ${errors.email ? "input-error" : ""}`}
                  placeholder="nom.prenom@email.fr"
                />
              </div>
              {errors.email && (
                <span className="error-message" role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Mot de passe */}
            <div className="form-field">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register("password", {
                    required: "Le mot de passe est obligatoire",
                    minLength: {
                      value: 8,
                      message: "8 caractères minimum",
                    },
                  })}
                  aria-invalid={errors.password ? "true" : "false"}
                  className={`field ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </button>
              </div>
              {errors.password && (
                <span className="error-message" role="alert">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="button-submit">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </button>
            </div>
          </form>

          {/* Lien inscription */}
          <p className="auth-redirect">
            Pas encore de compte ?{" "}
            <Link to="/registration">Créer un compte</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Connect;
