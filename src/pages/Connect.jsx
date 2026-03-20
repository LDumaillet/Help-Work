import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import Footer from "../components/Footer";

const Connect = () => {
  // État pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);
  // État pour simuler une erreur serveur (ex: mauvais identifiants)
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur", // Valide quand l'utilisateur quitte un champ
  });

  const onSubmit = async (data) => {
    setServerError(""); // Réinitialise l'erreur serveur

    // Simulation d'un appel API (chargement de 2 secondes)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Données envoyées :", data);
    // Exemple de gestion d'erreur serveur après l'appel
    // setServerError("Email ou mot de passe incorrect.");
  };

  return (
    <div className="flux">
      <Header />

      <div className="connect">
        <h2>Connexion</h2>
      </div>

      <div className="form-connect">
        {/* Message d'erreur global (Serveur) */}
        {serverError && <div className="alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Champ Email */}
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              autoFocus // Le curseur est ici par défaut
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
                    value: 10,
                    message:
                      "Le mot de passe doit contenir au moins 10 caractères",
                  },
                })}
                aria-invalid={errors.password ? "true" : "false"}
                className={`field ${errors.password ? "input-error" : ""}`}
                placeholder="****************"
              />
              {/* Bouton pour afficher/masquer */}
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
