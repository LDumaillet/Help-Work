import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useForm, useWatch } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCamera,
  faEnvelope,
  faUser,
  faLock,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";

const Registration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [inscriptionReussie, setInscriptionReussie] = useState(false);
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const passwordValue = useWatch({ control, name: "password" });

  const passwordChecks = {
    length: passwordValue?.length >= 10,
    uppercase: /[A-Z]/.test(passwordValue || ""),
    lowercase: /[a-z]/.test(passwordValue || ""),
    number: /\d/.test(passwordValue || ""),
    special: /[^A-Za-z0-9]/.test(passwordValue || ""),
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 2MB.");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      let avatarBase64 = "";
      if (avatarFile) {
        avatarBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(avatarFile);
        });
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: data.username,
          email: data.email,
          motDePasse: data.password,
          avatar: avatarBase64,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setNomUtilisateur(data.username);
      setInscriptionReussie(true);
      setTimeout(() => navigate("/connect"), 5000);
    } catch (err) {
      setServerError(err.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="flux">
      <Header />

      <div className="auth-page">
        <div className="auth-card">
          {inscriptionReussie ? (
            // ─── PAGE DE SUCCÈS ───────────────────────────
            <div className="inscription-succes">
              <div className="succes-icon">✅</div>
              <h2>Compte créé avec succès !</h2>
              <p>
                Bienvenue sur Help Work, <strong>{nomUtilisateur}</strong> !
              </p>
              <p className="succes-redirect">
                Vous allez être redirigé vers la page de connexion dans quelques
                secondes...
              </p>
              <Link to="/connect" className="btn-primary">
                Se connecter maintenant
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          ) : (
            // ─── FORMULAIRE ───────────────────────────────
            <>
              <div className="auth-header">
                <img src="/logo.webp" alt="logo" className="auth-logo" />
                <h2>Créer un compte</h2>
                <p className="auth-subtitle">
                  Rejoignez votre espace de travail
                </p>
              </div>

              {serverError && <div className="alert-error">{serverError}</div>}

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="auth-form"
              >
                {/* Avatar */}
                <div className="form-field avatar-field">
                  <label>Photo de profil</label>
                  <div className="avatar-upload">
                    <div
                      className="avatar-preview"
                      onClick={() =>
                        document.getElementById("avatarInput").click()
                      }
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Aperçu avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          <FontAwesomeIcon icon={faCamera} />
                          <span>Choisir une photo</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="avatarInput"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                    />
                    {avatarPreview && (
                      <button
                        type="button"
                        className="avatar-remove"
                        onClick={() => {
                          setAvatarPreview(null);
                          setAvatarFile(null);
                        }}
                      >
                        Supprimer la photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Nom d'utilisateur */}
                <div className="form-field">
                  <label htmlFor="username">Nom d'utilisateur</label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    <input
                      type="text"
                      id="username"
                      {...register("username", {
                        required: "Le pseudo est requis",
                      })}
                      className={`field ${errors.username ? "input-error" : ""}`}
                      placeholder="Votre pseudo"
                    />
                  </div>
                  {errors.username && (
                    <span className="error-message">
                      {errors.username.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      {...register("email", {
                        required: "L'email est requis",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Email invalide",
                        },
                      })}
                      className={`field ${errors.email ? "input-error" : ""}`}
                      placeholder="nom.prenom@email.fr"
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message">
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
                        required: "Mot de passe requis",
                        minLength: {
                          value: 10,
                          message: "10 caractères minimum",
                        },
                        validate: {
                          hasUppercase: (v) =>
                            /[A-Z]/.test(v) || "Une majuscule requise",
                          hasLowercase: (v) =>
                            /[a-z]/.test(v) || "Une minuscule requise",
                          hasNumber: (v) => /\d/.test(v) || "Un chiffre requis",
                          hasSpecialChar: (v) =>
                            /[^A-Za-z0-9]/.test(v) ||
                            "Un caractère spécial requis",
                        },
                      })}
                      className={`field ${errors.password ? "input-error" : ""}`}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="show-btn"
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">
                      {errors.password.message}
                    </span>
                  )}
                  <ul className="password-rules">
                    <li className={passwordChecks.length ? "valid" : "invalid"}>
                      • 10 caractères minimum
                    </li>
                    <li
                      className={passwordChecks.uppercase ? "valid" : "invalid"}
                    >
                      • Une majuscule
                    </li>
                    <li
                      className={passwordChecks.lowercase ? "valid" : "invalid"}
                    >
                      • Une minuscule
                    </li>
                    <li className={passwordChecks.number ? "valid" : "invalid"}>
                      • Un chiffre
                    </li>
                    <li
                      className={passwordChecks.special ? "valid" : "invalid"}
                    >
                      • Un caractère spécial
                    </li>
                  </ul>
                </div>

                {/* Confirmation mot de passe */}
                <div className="form-field">
                  <label htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </label>
                  <div className="input-wrapper">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      {...register("confirmPassword", {
                        required: "Veuillez confirmer le mot de passe",
                        validate: (v) =>
                          v === passwordValue ||
                          "Les mots de passe ne correspondent pas",
                      })}
                      className={`field ${errors.confirmPassword ? "input-error" : ""}`}
                      placeholder="••••••••••••"
                    />
                  </div>
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

              <p className="auth-redirect">
                Déjà un compte ? <Link to="/connect">Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Registration;
