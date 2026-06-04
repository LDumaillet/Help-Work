import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MenuLeft from "../components/MenuLeft";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "../components/ConfirmModal";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonKpi from "../components/SkeletonKpi";
import API_URL from "../config";
const ITEMS_PER_PAGE = 9;

const Cases = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [layout, setLayout] = useState("grid-3");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [newDossier, setNewDossier] = useState({
    titre: "",
    client: "",
    dateEcheance: "",
  });
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchDossiers = async () => {
    try {
      const res = await fetch("/api/dossiers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDossiers(data);
    } catch {
      setErreur("Impossible de charger les dossiers.");
    } finally {
      setLoading(false);
    }
  };

  // Ajoute ces states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmLabel: "Confirmer",
    confirmColor: "danger",
  });

  const closeConfirm = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

  const openConfirm = ({
    title,
    message,
    onConfirm,
    confirmLabel = "Confirmer",
    confirmColor = "danger",
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmLabel,
      confirmColor,
    });
  };

  useEffect(() => {
    fetchDossiers();
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
      setShowModal(false);
      setNewDossier({
        titre: "",
        client: "",
        dateEcheance: "",
        tempsTotal: "",
        coutTotal: "",
        revenuFinal: "",
      });
      await fetchDossiers();
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

  // Remplace handleCloturer
  const handleCloturer = (id) => {
    openConfirm({
      title: "Clôturer le dossier",
      message:
        "Confirmer la clôture de ce dossier ? Le statut passera à Terminé.",
      confirmLabel: "Clôturer",
      confirmColor: "warning",
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await fetch(`${API_URL}/api/dossiers/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ statut: "termine" }),
          });
          if (!res.ok) throw new Error();
          setDossiers((prev) =>
            prev.map((d) => (d._id === id ? { ...d, statut: "termine" } : d)),
          );
        } catch {
          alert("Erreur lors de la clôture du dossier.");
        }
      },
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  const getStatutLabel = (statut) => {
    const labels = {
      en_cours: "En cours",
      attente: "Attente",
      termine: "Terminé",
      archive: "Archivé",
    };
    return labels[statut] || statut;
  };

  const filteredCases = useMemo(() => {
    let data = [...dossiers];
    if (search) {
      data = data.filter(
        (c) =>
          c.client.toLowerCase().includes(search.toLowerCase()) ||
          c.titre.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (statusFilter) data = data.filter((c) => c.statut === statusFilter);
    if (sortBy === "amount-asc")
      data.sort((a, b) => a.revenuFinal - b.revenuFinal);
    if (sortBy === "amount-desc")
      data.sort((a, b) => b.revenuFinal - a.revenuFinal);
    if (sortBy === "client")
      data.sort((a, b) => a.client.localeCompare(b.client));
    return data;
  }, [search, statusFilter, sortBy, dossiers]);

  useEffect(() => {
    fetchDossiers();
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCases.length / ITEMS_PER_PAGE),
  );

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCases.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCases, currentPage]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const getDateStatus = (date, statut) => {
    if (statut === "termine" || statut === "archive") return "";
    if (!date) return "";
    const today = new Date();
    const d = new Date(date);
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) return "today";
    if (d < today) return "late";
    return "future";
  };

  const getRentabiliteStatus = (rentabilite, statut) => {
    if (statut === "termine" || statut === "archive") return "";
    if (rentabilite < 0) return "negative-rentabilite";
    if (rentabilite < 100) return "low-rentabilite";
    return "";
  };

  return (
    <div className="flux">
      <Header />

      <div className="body-dashboard">
        <MenuLeft />

        <div className="dashboard-user full">
          <div className="cases-header">
            <h1>Gestion des Dossiers</h1>
            <div className="cases-header-actions">
              <span className="count">{filteredCases.length} dossier(s)</span>
              <button className="add-btn" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faPlus} />
                Nouveau dossier
              </button>
            </div>
          </div>

          {loading && (
            <>
              <div className="cases-controls">
                <div
                  className="skeleton-line"
                  style={{
                    width: "200px",
                    height: "38px",
                    borderRadius: "10px",
                  }}
                />
                <div
                  className="skeleton-line"
                  style={{
                    width: "140px",
                    height: "38px",
                    borderRadius: "10px",
                  }}
                />
              </div>
              <div className="skeleton-grid grid-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} lines={4} />
                ))}
              </div>
            </>
          )}
          {erreur && <p className="alert-error">{erreur}</p>}

          {!loading && !erreur && (
            <>
              {/* FILTER BAR */}
              <div className="cases-controls">
                <input
                  type="text"
                  placeholder="Rechercher un client ou un titre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Tous statuts</option>
                  <option value="en_cours">En cours</option>
                  <option value="attente">
                    Attente de pièce justificative
                  </option>
                  <option value="termine">Terminé</option>
                  <option value="archive">Archivé</option>
                </select>
                <select onChange={(e) => setSortBy(e.target.value)}>
                  <option value="">Trier par</option>
                  <option value="amount-asc">Montant ↑</option>
                  <option value="amount-desc">Montant ↓</option>
                  <option value="client">Client A-Z</option>
                </select>
                <div className="layout-buttons">
                  <button onClick={() => setLayout("grid-2")}>2</button>
                  <button onClick={() => setLayout("grid-3")}>3</button>
                  <button onClick={() => setLayout("list")}>Liste</button>
                  <button onClick={() => setLayout("minimal")}>Min</button>
                </div>
              </div>

              {/* LÉGENDE */}
              <div className="cases-legend">
                <div className="legend-item">
                  <span className="legend-dot late"></span>
                  <span>Échéance dépassée</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot today"></span>
                  <span>Échéance aujourd'hui</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot low-rentabilite"></span>
                  <span>Rentabilité {"<"} 100%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot negative-rentabilite"></span>
                  <span>Perte</span>
                </div>
              </div>

              {/* CASES GRID */}
              <div className={`cases-grid ${layout}`}>
                {filteredCases.length === 0 && (
                  <div className="empty-state">
                    <p>📁 Aucun dossier trouvé.</p>
                    <p>Modifiez vos filtres ou créez un nouveau dossier.</p>
                  </div>
                )}
                {paginatedCases.map((item) => (
                  <div
                    key={item._id}
                    className={`cases-card ${getDateStatus(item.dateEcheance, item.statut)} ${getRentabiliteStatus(item.rentabilite, item.statut)} ${layout === "minimal" ? "minimal" : ""}`}
                  >
                    {layout === "minimal" ? (
                      <>
                        <div className="card-header">
                          <h3>{item.titre}</h3>
                          <span className={`status ${item.statut}`}>
                            {getStatutLabel(item.statut)}
                          </span>
                        </div>
                        <p>
                          <strong>Client :</strong> {item.client}
                        </p>
                        <button
                          className="details-btn"
                          onClick={() => navigate(`/cases/${item._id}`)}
                        >
                          Voir
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="card-header">
                          <h3>{item.titre}</h3>
                          <span className={`status ${item.statut}`}>
                            {getStatutLabel(item.statut)}
                          </span>
                        </div>
                        <p>
                          <strong>Client :</strong> {item.client}
                        </p>
                        <p>
                          <strong>Revenu :</strong>{" "}
                          {formatCurrency(item.revenuFinal)}
                        </p>
                        <p>
                          <strong>Coût :</strong>{" "}
                          {formatCurrency(item.coutTotal)}
                        </p>
                        <p>
                          <strong>Rentabilité :</strong>{" "}
                          {item.rentabilite.toFixed(1)} %
                        </p>
                        <p
                          className={`date ${getDateStatus(item.dateEcheance, item.statut)}`}
                        >
                          <strong>Echéance :</strong>{" "}
                          {formatDate(item.dateEcheance)}
                        </p>
                        <div className="card-actions">
                          <button
                            className="details-btn"
                            onClick={() => navigate(`/cases/${item._id}`)}
                          >
                            Voir le dossier
                          </button>
                          {item.statut === "en_cours" && (
                            <button
                              className="close-btn"
                              onClick={() => handleCloturer(item._id)}
                            >
                              Clôturer
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1,
                    )
                    .reduce((acc, page, idx, arr) => {
                      if (idx > 0 && page - arr[idx - 1] > 1) {
                        acc.push("...");
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((page, idx) =>
                      page === "..." ? (
                        <span key={`dots-${idx}`} className="pagination-dots">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ),
                    )}

                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>

                  <span className="pagination-info">
                    Page {currentPage} / {totalPages} — {filteredCases.length}{" "}
                    dossier(s)
                  </span>
                </div>
              )}
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
        confirmLabel={confirmModal.confirmLabel}
        confirmColor={confirmModal.confirmColor}
      />

      <Footer />
    </div>
  );
};

export default Cases;
