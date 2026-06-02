import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faLock,
  faEnvelope,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import Footer from "../components/Footer";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Connect = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [step, setStep] = useState("login");
  const [userId, setUserId] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  // ─── ÉTAPE 1 : Login ──────────────────────────────────────
  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, motDePasse: data.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.message || "Email ou mot de passe incorrect.");
        return;
      }
      // Passe à l'étape OTP
      setUserId(result.userId);
      setStep("otp");
    } catch {
      setServerError("Erreur serveur, réessaie plus tard.");
    }
  };

  // ─── GESTION SAISIE OTP ───────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // chiffres uniquement
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // un seul chiffre
    setOtp(newOtp);

    // Passe au champ suivant automatiquement
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Retour arrière — revient au champ précédent
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // ─── ÉTAPE 2 : Vérification OTP ──────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setOtpError("Entrez les 6 chiffres du code.");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });
      const result = await res.json();
      if (!res.ok) {
        setOtpError(result.message || "Code incorrect.");
        return;
      }
      login(result.user, result.token);
      navigate("/dashboard");
    } catch {
      setOtpError("Erreur serveur, réessaie plus tard.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setOtp(["", "", "", "", "", ""]);
    setStep("login");
  };

  return (
    <div className="flux">
      <Header />
      <div className="auth-page">
        <div className="auth-card">
          {step === "login" ? (
            // ─── FORMULAIRE DE CONNEXION ───────────────────
            <>
              <div className="auth-header">
                <img src="/logo.webp" alt="logo" className="auth-logo" />
                <h2>Connexion</h2>
                <p className="auth-subtitle">
                  Accédez à votre espace de travail
                </p>
              </div>

              {sessionExpired && (
                <div className="session-expired">
                  <span>🔒</span>
                  <p>Votre session a expiré. Veuillez vous reconnecter.</p>
                </div>
              )}

              {serverError && <div className="alert-error">{serverError}</div>}

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="auth-form"
              >
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
                      className={`field ${errors.password ? "input-error" : ""}`}
                      placeholder="••••••••••"
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
                  {errors.password && (
                    <span className="error-message">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div className="button-submit">
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Vérification..." : "Se connecter"}
                  </button>
                </div>
              </form>

              <p className="auth-redirect">
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
              </p>
              <p className="auth-redirect">
                Pas encore de compte ?{" "}
                <Link to="/registration">Créer un compte</Link>
              </p>
            </>
          ) : (
            // ─── ÉTAPE OTP ─────────────────────────────────
            <>
              <div className="auth-header">
                <div className="otp-shield">
                  <FontAwesomeIcon icon={faShield} />
                </div>
                <h2>Vérification</h2>
                <p className="auth-subtitle">
                  Un code à 6 chiffres a été envoyé à votre adresse email. Il
                  expire dans <strong>10 minutes</strong>.
                </p>
              </div>

              {otpError && <div className="alert-error">{otpError}</div>}

              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="otp-inputs" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`otp-input ${digit ? "filled" : ""}`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className="button-submit">
                  <button
                    type="submit"
                    disabled={otpLoading || otp.join("").length !== 6}
                  >
                    {otpLoading ? "Vérification..." : "Confirmer le code"}
                  </button>
                </div>
              </form>

              <p className="auth-redirect">
                Vous n'avez pas reçu le code ?{" "}
                <button className="link-btn" onClick={handleResendOtp}>
                  Réessayer
                </button>
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Connect;
