import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MenuLeft from "../components/MenuLeft";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import NetworkError from "../components/NetworkError";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonKpi from "../components/SkeletonKpi";
import API_URL from "../config";

const Dashboard = () => {
  const [layout, setLayout] = useState("grid-3");
  const [dossiers, setDossiers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [newDossier, setNewDossier] = useState({
    titre: "",
    client: "",
    dateEcheance: "",
  });
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [resDossiers, resStats] = await Promise.all([
        fetch(`${API_URL}/api/dossiers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/dossiers/stats/global`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // ===== TOKEN EXPIRE =====
      if (resDossiers.status === 401 || resStats.status === 401) {
        localStorage.clear();
        navigate("/connect");
        return;
      }

      // ===== SERVEUR HS / ERREUR BACK =====
      if (resDossiers.status >= 500 || resStats.status >= 500) {
        setNetworkError(true);
        return;
      }

      const dataDossiers = await resDossiers.json();
      const dataStats = await resStats.json();

      if (!resDossiers.ok) throw new Error(dataDossiers.message);
      if (!resStats.ok) throw new Error(dataStats.message);

      setDossiers(dataDossiers);
      setStats(dataStats);
    } catch {
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    setNewDossier({ ...newDossier, [e.target.name]: e.target.value });
  };

  const handleAddDossier = async (e) => {
    e.preventDefault();
    setFormErreur("");
    setFormLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/dossiers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titre: newDossier.titre,
          client: newDossier.client,
          dateEcheance: newDossier.dateEcheance,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Ferme la modale et recharge les données
      setShowModal(false);
      setNewDossier({
        titre: "",
        client: "",
        dateEcheance: "",
        tempsTotal: "",
        coutTotal: "",
        revenuFinal: "",
      });
      await fetchData();
    } catch {
      setFormErreur("Erreur lors de la création du dossier.");
    } finally {
      setFormLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormErreur("");
    setNewDossier({ titre: "", client: "", dateEcheance: "" });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value ?? 0);

  const getStatutLabel = (statut) => {
    const labels = {
      en_cours: "En cours",
      termine: "Terminé",
      archive: "Archivé",
    };
    return labels[statut] || statut;
  };

  return (
    <div className="flux">
      <Header />

      <div className="body-dashboard">
        <MenuLeft />

        <div className="dashboard-user">
          <div className="layout-controls">
            <button onClick={() => setLayout("grid-2")}>2 colonnes</button>
            <button onClick={() => setLayout("grid-3")}>3 colonnes</button>
            <button onClick={() => setLayout("grid-4")}>4 colonnes</button>
            <button onClick={() => setLayout("list")}>Liste</button>
          </div>

          {loading && (
            <>
              {/* KPI skeleton */}
              <section className="dashboard-kpi">
                <h2>Statistiques globales</h2>
                <SkeletonKpi count={5} />
              </section>

              {/* Cards skeleton */}
              <section className="cases">
                <div className="cases-header">
                  <h2>Liste des dossiers</h2>
                </div>
                <ul className="cases-list grid-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i}>
                      <SkeletonCard lines={3} />
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
          {!loading && !networkError && erreur && (
            <p className="alert-error">{erreur}</p>
          )}

          {!loading && !networkError && !erreur && (
            <>
              {/* KPI DASHBOARD */}
              <section className="dashboard-kpi">
                <h2>Statistiques globales</h2>
                <div className="kpi-grid">
                  <div className="kpi-card capital">
                    <span>Capital total</span>
                    <strong>{formatCurrency(stats?.capital)}</strong>
                  </div>
                  <div className="kpi-card positive">
                    <span>Entrées totales</span>
                    <strong>+ {formatCurrency(stats?.entrees)}</strong>
                  </div>
                  <div className="kpi-card negative">
                    <span>Sorties totales</span>
                    <strong>- {formatCurrency(stats?.sorties)}</strong>
                  </div>
                  <div className="kpi-card rentabilite">
                    <span>Total dossiers</span>
                    <strong>{stats?.totalDossiers ?? 0}</strong>
                  </div>
                  <div className="kpi-card rentabilite">
                    <span>Total opérations</span>
                    <strong>{stats?.totalOperations ?? 0}</strong>
                  </div>
                </div>
              </section>

              {/* Liste des dossiers */}
              <section className="cases">
                <div className="cases-header">
                  <h2>Liste des dossiers</h2>
                  <button
                    className="add-btn"
                    onClick={() => setShowModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Nouveau dossier
                  </button>
                </div>

                {dossiers.length === 0 ? (
                  <div className="empty-state">
                    <p>📁 Vous n'avez aucun dossier pour le moment.</p>
                    <p>
                      Cliquez sur <strong>Nouveau dossier</strong> pour
                      commencer.
                    </p>
                  </div>
                ) : (
                  <ul className={`cases-list ${layout}`}>
                    {dossiers.map((dossier) => (
                      <li key={dossier._id}>
                        <article className="cases-card">
                          <div className="card-header">
                            <h3>{dossier.titre}</h3>
                            <span className={`status ${dossier.statut}`}>
                              {getStatutLabel(dossier.statut)}
                            </span>
                          </div>
                          <p>
                            <strong>Client :</strong> {dossier.client}
                          </p>
                          <p>
                            <strong>Revenu :</strong>{" "}
                            {formatCurrency(dossier.revenuFinal)}
                          </p>
                          <p>
                            <strong>Rentabilité :</strong>{" "}
                            {dossier.rentabilite.toFixed(1)} %
                          </p>
                          <button
                            className="details-btn"
                            onClick={() => navigate(`/cases/${dossier._id}`)}
                          >
                            Voir le dossier
                          </button>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Stats opérations */}
              <section className={`stats-summary ${layout}`}>
                <h2>Opérations</h2>
                <article className="stat-card capital">
                  <h3>Total des opérations</h3>
                  <p>{stats?.totalOperations ?? 0}</p>
                </article>
                <article className="stat-card positive">
                  <h3>Total entrées</h3>
                  <p>+ {formatCurrency(stats?.entrees)}</p>
                </article>
                <article className="stat-card negative">
                  <h3>Total sorties</h3>
                  <p>- {formatCurrency(stats?.sorties)}</p>
                </article>
              </section>
            </>
          )}
        </div>
      </div>

      {/* MODALE */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouveau dossier</h2>
              <button className="modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {formErreur && <div className="alert-error">{formErreur}</div>}

            <form onSubmit={handleAddDossier} className="modal-form">
              <div className="form-field">
                <label>Titre *</label>
                <input
                  name="titre"
                  value={newDossier.titre}
                  onChange={handleChange}
                  placeholder="Nom du dossier"
                  required
                />
              </div>

              <div className="form-field">
                <label>Client</label>
                <input
                  name="client"
                  value={newDossier.client}
                  onChange={handleChange}
                  placeholder="Nom du client"
                />
              </div>

              <div className="form-field">
                <label>Date d'échéance</label>
                <input
                  type="date"
                  name="dateEcheance"
                  value={newDossier.dateEcheance}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={formLoading}
                >
                  {formLoading ? "Création..." : "Créer le dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
