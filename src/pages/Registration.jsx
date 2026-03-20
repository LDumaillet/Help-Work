import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useForm, useWatch } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Registration = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const passwordValue = useWatch({
    control,
    name: "password",
  });

  const passwordChecks = {
    length: passwordValue?.length >= 10,
    uppercase: /[A-Z]/.test(passwordValue || ""),
    lowercase: /[a-z]/.test(passwordValue || ""),
    number: /\d/.test(passwordValue || ""),
    special: /[^A-Za-z0-9]/.test(passwordValue || ""),
  };

  const onSubmit = async (data) => {
    console.log("Données d'inscription :", data);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div className="flux">
      <Header />
      <div className="connect">
        <h2>Créer un compte</h2>
      </div>

      <div className="form-connect">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Pseudo */}
          <div className="form-field">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              {...register("username", { required: "Le pseudo est requis" })}
              className={`field ${errors.username ? "input-error" : ""}`}
            />
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "L'email est requis",
                pattern: { value: /^\S+@\S+$/i, message: "Email invalide" },
              })}
              className={`field ${errors.email ? "input-error" : ""}`}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          {/* Mot de passe */}
          <div className="form-field">
            <label htmlFor="password">Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password", {
                  required: "Mot de passe requis",
                  minLength: { value: 10, message: "10 caractères minimum" },
                  validate: {
                    hasUppercase: (value) =>
                      /[A-Z]/.test(value) || "Une majuscule requise",
                    hasLowercase: (value) =>
                      /[a-z]/.test(value) || "Une minuscule requise",
                    hasNumber: (value) =>
                      /\d/.test(value) || "Un chiffre requis",
                    hasSpecialChar: (value) =>
                      /[^A-Za-z0-9]/.test(value) ||
                      "Un caractère spécial requis",
                  },
                })}
                className={`field ${errors.password ? "input-error" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="show-btn"
              >
                {showPassword ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}

            <ul className="password-rules">
              <li className={passwordChecks.length ? "valid" : "invalid"}>
                • 10 caractères minimum
              </li>
              <li className={passwordChecks.uppercase ? "valid" : "invalid"}>
                • Une majuscule
              </li>
              <li className={passwordChecks.lowercase ? "valid" : "invalid"}>
                • Une minuscule
              </li>
              <li className={passwordChecks.number ? "valid" : "invalid"}>
                • Un chiffre
              </li>
              <li className={passwordChecks.special ? "valid" : "invalid"}>
                • Un caractère spécial
              </li>
            </ul>
          </div>

          {/* Confirmation du mot de passe */}
          <div className="form-field">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Veuillez confirmer le mot de passe",
                validate: (value) =>
                  value === passwordValue ||
                  "Les mots de passe ne correspondent pas",
              })}
              className={`field ${errors.confirmPassword ? "input-error" : ""}`}
            />
            {errors.confirmPassword && (
              <span className="error-message">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <div className="button-submit">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "S'inscrire"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Registration;
