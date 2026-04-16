import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Connect = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
  });

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

      <div className="connect">
        <h2>Connexion</h2>
      </div>

      <div className="form-connect">
        {serverError && <div className="alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Champ Email */}
          <div className="form-field">
            <label htmlFor="email">Email</label>
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
            {errors.email && (
              <span className="error-message" role="alert">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div className="form-field">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-wrapper" style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password", {
                  required: "Le mot de passe est obligatoire",
                  minLength: {
                    value: 8,
                    message:
                      "Le mot de passe doit contenir au moins 8 caractères",
                  },
                })}
                aria-invalid={errors.password ? "true" : "false"}
                className={`field ${errors.password ? "input-error" : ""}`}
                placeholder="****************"
              />
              <button
                type="button"
                className="show-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
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
              {isSubmitting ? "Chargement..." : "Se connecter"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Connect;
