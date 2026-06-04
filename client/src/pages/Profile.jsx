import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faUser,
  faEnvelope,
  faLock,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import API_URL from "../config";

const Profile = () => {
  const auth = useAuth();
  console.log("Contenu de useAuth:", auth);
  const { token, user, updateUser } = useAuth(); // ← ici à l'intérieur
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    nom: "",
    email: "",
    avatar: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmMotDePasse: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSucces, setProfileSucces] = useState("");
  const [profileErreur, setProfileErreur] = useState("");
  const [passwordSucces, setPasswordSucces] = useState("");
  const [passwordErreur, setPasswordErreur] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/connect");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProfileForm({
          nom: data.nom,
          email: data.email,
          avatar: data.avatar || "",
        });
        setAvatarPreview(data.avatar || null);
      } catch {
        navigate("/connect");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleAvatarChange = async (e) => {
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

    setAvatarLoading(true);

    try {
      // Convertit en base64
      const avatarBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      // Prévisualisation immédiate
      setAvatarPreview(avatarBase64);

      // Sauvegarde immédiate en base de données
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: profileForm.nom,
          email: profileForm.email,
          avatar: avatarBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Met à jour le formulaire, la prévisualisation et le contexte
      setProfileForm((prev) => ({ ...prev, avatar: avatarBase64 }));
      updateUser(data);
      setProfileSucces("Avatar mis à jour !");
    } catch {
      alert("Erreur lors de la mise à jour de l'avatar.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileErreur("");
    setProfileSucces("");
    setProfileLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      updateUser(data); // ← updateUser au lieu de login
      setProfileSucces("Profil mis à jour avec succès !");
    } catch (err) {
      setProfileErreur(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErreur("");
    setPasswordSucces("");

    if (passwordForm.nouveauMotDePasse !== passwordForm.confirmMotDePasse) {
      setPasswordErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    if (passwordForm.nouveauMotDePasse.length < 8) {
      setPasswordErreur(
        "Le nouveau mot de passe doit faire au moins 8 caractères.",
      );
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ancienMotDePasse: passwordForm.ancienMotDePasse,
          nouveauMotDePasse: passwordForm.nouveauMotDePasse,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPasswordSucces("Mot de passe modifié avec succès !");
      setPasswordForm({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmMotDePasse: "",
      });
    } catch (err) {
      setPasswordErreur(
        err.message || "Erreur lors du changement de mot de passe.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flux">
        <Header />
        <p>Chargement...</p>
        <Footer />
      </div>
    );

  return (
    <div className="flux">
      <Header />

      <div className="profile-page">
        <h1>Mon profil</h1>

        {/* AVATAR */}
        <div className="profile-avatar-section">
          <div
            className="profile-avatar"
            onClick={() =>
              !avatarLoading &&
              document.getElementById("avatarProfileInput").click()
            }
          >
            {avatarLoading ? (
              <span className="avatar-loading">Envoi...</span>
            ) : avatarPreview ? (
              <img src={avatarPreview} alt="avatar" />
            ) : (
              <div className="avatar-placeholder">
                <FontAwesomeIcon icon={faCamera} />
              </div>
            )}
            <div className="avatar-overlay">
              <FontAwesomeIcon icon={faCamera} />
            </div>
          </div>
          <input
            type="file"
            id="avatarProfileInput"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
          <div className="profile-avatar-info">
            <h2>{user?.nom}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-grid">
          {/* INFOS PERSONNELLES */}
          <section className="detail-section">
            <h2>Informations personnelles</h2>

            {profileErreur && (
              <div className="alert-error">{profileErreur}</div>
            )}
            {profileSucces && (
              <div className="alert-success">{profileSucces}</div>
            )}

            <form onSubmit={handleProfileSubmit} className="auth-form">
              <div className="form-field">
                <label>Nom d'utilisateur</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                  <input
                    className="field"
                    type="text"
                    value={profileForm.nom}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, nom: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Email</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input
                    className="field"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="button-submit">
                <button
                  type="submit"
                  disabled={profileLoading || avatarLoading}
                >
                  {profileLoading ? (
                    "Enregistrement..."
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* MOT DE PASSE */}
          <section className="detail-section">
            <h2>Changer le mot de passe</h2>

            {passwordErreur && (
              <div className="alert-error">{passwordErreur}</div>
            )}
            {passwordSucces && (
              <div className="alert-success">{passwordSucces}</div>
            )}

            <form onSubmit={handlePasswordSubmit} className="auth-form">
              <div className="form-field">
                <label>Ancien mot de passe</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    className="field"
                    type="password"
                    value={passwordForm.ancienMotDePasse}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        ancienMotDePasse: e.target.value,
                      })
                    }
                    required
                    placeholder="••••••••••"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Nouveau mot de passe</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    className="field"
                    type="password"
                    value={passwordForm.nouveauMotDePasse}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        nouveauMotDePasse: e.target.value,
                      })
                    }
                    required
                    placeholder="••••••••••"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Confirmer le nouveau mot de passe</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    className="field"
                    type="password"
                    value={passwordForm.confirmMotDePasse}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmMotDePasse: e.target.value,
                      })
                    }
                    required
                    placeholder="••••••••••"
                  />
                </div>
              </div>

              <div className="button-submit">
                <button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    "Modification..."
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} />
                      Changer le mot de passe
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
