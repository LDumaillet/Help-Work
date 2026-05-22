import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faArrowTrendUp,
  faArrowTrendDown,
  faCheck,
  faFlag,
  faFilePdf,
  faPlay,
  faPause,
  faRotateLeft,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmModal from "../components/ConfirmModal";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonKpi from "../components/SkeletonKpi";

const CaseDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState(null);
  const [operations, setOperations] = useState([]);
  const [etapes, setEtapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [succès, setSuccès] = useState("");

  const [form, setForm] = useState({
    titre: "",
    client: "",
    dateEcheance: "",
    tempsTotal: "",
    statut: "",
  });

  const [newOp, setNewOp] = useState({
    type: "entree",
    montant: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

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

  const [newEtape, setNewEtape] = useState({ titre: "", dateButoir: "" });
  const [showOpForm, setShowOpForm] = useState(false);
  const [showEtapeForm, setShowEtapeForm] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [etapeLoading, setEtapeLoading] = useState(false);

  // ─── CHRONOMÈTRE ──────────────────────────────────────────
  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoSeconds, setChronoSeconds] = useState(0);
  const chronoRef = useRef(null);

  useEffect(() => {
    if (chronoRunning) {
      chronoRef.current = setInterval(() => {
        setChronoSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(chronoRef.current);
    }
    return () => clearInterval(chronoRef.current);
  }, [chronoRunning]);

  // Sauvegarde le temps quand on quitte la page
  useEffect(() => {
    return () => {
      if (chronoSeconds > 0) {
        saveChronoTime(chronoSeconds);
      }
    };
  }, [chronoSeconds]);

  const saveChronoTime = async (seconds) => {
    if (!dossier || seconds === 0) return;
    const heuresSupplementaires = seconds / 3600;
    const nouveauTemps = (dossier.tempsTotal || 0) + heuresSupplementaires;
    try {
      await fetch(`/api/dossiers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tempsTotal: Math.round(nouveauTemps * 100) / 100,
        }),
      });
    } catch {
      // Silencieux
    }
  };

  const handleChronoStart = () => setChronoRunning(true);

  const handleChronomPause = async () => {
    setChronoRunning(false);
    if (chronoSeconds > 0) {
      await saveChronoTime(chronoSeconds);
      // Met à jour le dossier localement
      const heuresSupplementaires = chronoSeconds / 3600;
      setDossier((prev) => ({
        ...prev,
        tempsTotal:
          Math.round(((prev.tempsTotal || 0) + heuresSupplementaires) * 100) /
          100,
      }));
      setForm((prev) => ({
        ...prev,
        tempsTotal:
          Math.round(
            ((Number(prev.tempsTotal) || 0) + heuresSupplementaires) * 100,
          ) / 100,
      }));
      setChronoSeconds(0);
    }
  };

  const handleChronoReset = () => {
    setChronoRunning(false);
    setChronoSeconds(0);
  };

  const formatChrono = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const formatTempsTotal = (heures) => {
    if (!heures) return "0h 00min";
    const h = Math.floor(heures);
    const m = Math.round((heures - h) * 60);
    return `${h}h ${m.toString().padStart(2, "0")}min`;
  };

  // ─── FETCH ────────────────────────────────────────────────
  const fetchDossier = async () => {
    try {
      const [resDossier, resOps, resEtapes] = await Promise.all([
        fetch(`/api/dossiers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/dossiers/${id}/operations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/dossiers/${id}/etapes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataDossier = await resDossier.json();
      const dataOps = await resOps.json();
      const dataEtapes = await resEtapes.json();

      if (!resDossier.ok) throw new Error(dataDossier.message);

      setDossier(dataDossier);
      setOperations(dataOps);
      setEtapes(dataEtapes);
      setForm({
        titre: dataDossier.titre,
        client: dataDossier.client,
        dateEcheance: dataDossier.dateEcheance
          ? new Date(dataDossier.dateEcheance).toISOString().split("T")[0]
          : "",
        tempsTotal: dataDossier.tempsTotal,
        statut: dataDossier.statut,
      });
    } catch {
      setErreur("Impossible de charger ce dossier.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [id, token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSuccès("");
    try {
      const res = await fetch(`/api/dossiers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDossier(data);
      setSuccès("Dossier mis à jour avec succès !");
    } catch {
      setErreur("Erreur lors de la mise à jour.");
    }
  };

  const handleCloturer = () => {
    openConfirm({
      title: "Clôturer le dossier",
      message:
        "Confirmer la clôture de ce dossier ? Vous serez ensuite redirigé vers la liste des dossiers.",
      confirmLabel: "Clôturer",
      confirmColor: "warning",

      onConfirm: async () => {
        closeConfirm();

        try {
          const res = await fetch(`/api/dossiers/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...form,
              statut: "termine",
            }),
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.message);

          setDossier(data);

          setForm((prev) => ({
            ...prev,
            statut: "termine",
          }));

          setSuccès("Dossier clôturé avec succès !");

          // Petite pause avant redirection
          setTimeout(() => {
            navigate("/cases");
          }, 1200);
        } catch {
          setErreur("Erreur lors de la clôture du dossier.");
        }
      },
    });
  };

  const handleAddOperation = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    try {
      const res = await fetch(`/api/dossiers/${id}/operations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newOp),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOperations((prev) => [data.operation, ...prev]);
      setDossier(data.dossier);
      setNewOp({
        type: "entree",
        montant: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowOpForm(false);
    } catch {
      setErreur("Erreur lors de l'ajout de l'opération.");
    } finally {
      setOpLoading(false);
    }
  };

  const handleDeleteOperation = async (opId) => {
    openConfirm({
      title: "Supprimer l'opération",
      message:
        "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette opération ?",
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await fetch(`/api/dossiers/${id}/operations/${opId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          setOperations((prev) => prev.filter((o) => o._id !== opId));
          setDossier(data.dossier);
        } catch {
          setErreur("Erreur lors de la suppression.");
        }
      },
    });
  };

  const handleAddEtape = async (e) => {
    e.preventDefault();
    setEtapeLoading(true);
    try {
      const res = await fetch(`/api/dossiers/${id}/etapes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEtape),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEtapes((prev) => [...prev, data]);
      setNewEtape({ titre: "", dateButoir: "" });
      setShowEtapeForm(false);
    } catch {
      setErreur("Erreur lors de l'ajout de l'étape.");
    } finally {
      setEtapeLoading(false);
    }
  };

  const handleToggleEtape = async (etape) => {
    try {
      const res = await fetch(`/api/dossiers/${id}/etapes/${etape._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ faite: !etape.faite }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEtapes((prev) => prev.map((e) => (e._id === etape._id ? data : e)));
    } catch {
      setErreur("Erreur lors de la mise à jour de l'étape.");
    }
  };

  const handleDeleteEtape = async (etapeId) => {
    openConfirm({
      title: "Supprimer l'étape",
      message: "Êtes-vous sûr de vouloir supprimer cette étape ?",
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        closeConfirm();
        try {
          const res = await fetch(`/api/dossiers/${id}/etapes/${etapeId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error();
          setEtapes((prev) => prev.filter((e) => e._id !== etapeId));
        } catch {
          setErreur("Erreur lors de la suppression de l'étape.");
        }
      },
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value ?? 0);

  const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");

  const progression =
    etapes.length > 0
      ? Math.round((etapes.filter((e) => e.faite).length / etapes.length) * 100)
      : 0;

  const exportPDF = async () => {
    const doc = new jsPDF();
    const dateExport = new Date().toLocaleDateString("fr-FR");

    const kakiColor = [88, 91, 76];
    const beigeColor = [130, 109, 98];
    const whiteColor = [255, 255, 255];
    const greyLight = [245, 245, 245];

    // ─── LOGO BASE64 ─────────────────────────────────────
    const getLogoBase64 = () => {
      return new Promise((resolve) => {
        const img = new Image();

        img.crossOrigin = "anonymous";

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          resolve(canvas.toDataURL("image/png"));
        };

        img.onerror = () => resolve(null);

        img.src = "/logo.webp";
      });
    };

    const logoBase64 = await getLogoBase64();

    // ─── HEADER ──────────────────────────────────────────
    doc.setFillColor(...kakiColor);
    doc.rect(0, 0, 210, 45, "F");

    // Logo
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 10, 5, 32, 32);
    }

    // Texte header
    doc.setTextColor(...whiteColor);

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HELP WORK", 48, 18);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Rapport de dossier", 48, 27);
    doc.text(`Exporté le ${dateExport}`, 48, 35);

    // ─── TITRE DOSSIER ───────────────────────────────────
    doc.setFillColor(...beigeColor);
    doc.rect(0, 45, 210, 10, "F");

    doc.setTextColor(...whiteColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    doc.text(`Dossier : ${dossier.titre}`, 14, 52);

    // ─── TITRE PRINCIPAL ─────────────────────────────────
    doc.setTextColor(...kakiColor);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    doc.text(dossier.titre, 14, 68);

    const statutLabels = {
      en_cours: "En cours",
      attente: "Attente de pièce justificative",
      termine: "Terminé",
      archive: "Archivé",
    };

    autoTable(doc, {
      startY: 58,
      head: [["Informations", "Valeur"]],
      body: [
        ["Client", dossier.client || "—"],
        ["Statut", statutLabels[dossier.statut] || dossier.statut],
        [
          "Date d'échéance",
          dossier.dateEcheance ? formatDate(dossier.dateEcheance) : "—",
        ],
        ["Temps total", formatTempsTotal(dossier.tempsTotal)],
      ],
      theme: "grid",
      headStyles: {
        fillColor: kakiColor,
        textColor: whiteColor,
        fontStyle: "bold",
        fontSize: 10,
      },
      alternateRowStyles: { fillColor: greyLight },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 120 },
      },
    });

    const yKpi = doc.lastAutoTable.finalY + 12;
    doc.setFillColor(...beigeColor);
    doc.rect(0, yKpi - 4, 210, 8, "F");
    doc.setTextColor(...whiteColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Résumé financier", 14, yKpi + 2);

    autoTable(doc, {
      startY: yKpi + 8,
      head: [["Entrées", "Sorties", "Solde", "Rentabilité"]],
      body: [
        [
          formatCurrency(dossier.revenuFinal),
          formatCurrency(dossier.coutTotal),
          formatCurrency((dossier.revenuFinal ?? 0) - (dossier.coutTotal ?? 0)),
          `${dossier.rentabilite?.toFixed(1)} %`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: beigeColor,
        textColor: whiteColor,
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: { fontSize: 10, cellPadding: 4, halign: "center" },
    });

    if (etapes.length > 0) {
      const yEtapes = doc.lastAutoTable.finalY + 12;
      doc.setFillColor(...kakiColor);
      doc.rect(0, yEtapes - 4, 210, 8, "F");
      doc.setTextColor(...whiteColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Étapes & Jalons (${progression}% complété)`, 14, yEtapes + 2);
      autoTable(doc, {
        startY: yEtapes + 8,
        head: [["Étape", "Date butoir", "Statut"]],
        body: etapes.map((e) => [
          e.titre,
          e.dateButoir ? formatDate(e.dateButoir) : "—",
          e.faite ? "✓ Complétée" : "En attente",
        ]),
        theme: "grid",
        headStyles: {
          fillColor: kakiColor,
          textColor: whiteColor,
          fontStyle: "bold",
          fontSize: 10,
        },
        alternateRowStyles: { fillColor: greyLight },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 50, halign: "center" },
          2: { cellWidth: 40, halign: "center" },
        },
      });
    }

    if (operations.length > 0) {
      const yOps = doc.lastAutoTable.finalY + 12;
      doc.setFillColor(...beigeColor);
      doc.rect(0, yOps - 4, 210, 8, "F");
      doc.setTextColor(...whiteColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Opérations financières", 14, yOps + 2);
      autoTable(doc, {
        startY: yOps + 8,
        head: [["Date", "Description", "Type", "Montant"]],
        body: operations.map((op) => [
          formatDate(op.date),
          op.description || "Sans description",
          op.type === "entree" ? "Entrée" : "Sortie",
          `${op.type === "entree" ? "+" : "-"} ${formatCurrency(op.montant)}`,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: beigeColor,
          textColor: whiteColor,
          fontStyle: "bold",
          fontSize: 10,
        },
        alternateRowStyles: { fillColor: greyLight },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 30, halign: "center" },
          1: { cellWidth: 90 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 40, halign: "right" },
        },
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(...kakiColor);
      doc.rect(0, 285, 210, 12, "F");
      doc.setTextColor(...whiteColor);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Help Work — Rapport généré automatiquement", 14, 292);
      doc.text(`Page ${i} / ${pageCount}`, 190, 292, { align: "right" });
    }

    doc.save(
      `dossier-${dossier.titre.replace(/\s+/g, "-").toLowerCase()}-${dateExport.replace(/\//g, "-")}.pdf`,
    );
  };

  if (loading)
    return (
      <div className="flux">
        <Header />
        <div className="case-detail">
          {/* KPI skeleton */}
          <SkeletonKpi count={4} />

          {/* Section skeleton */}
          <div className="skeleton-section">
            <div className="skeleton-line title" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-line"
                style={{ width: `${90 - i * 8}%` }}
              />
            ))}
          </div>

          <div className="skeleton-section">
            <div className="skeleton-line title" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-line"
                style={{ width: `${85 - i * 10}%` }}
              />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="flux">
      <Header />

      <div className="case-detail">
        <button className="back-btn" onClick={() => navigate("/cases")}>
          ← Retour aux dossiers
        </button>

        <button className="export-btn" onClick={exportPDF}>
          <FontAwesomeIcon icon={faFilePdf} />
          Exporter en PDF
        </button>

        <h1>Dossier — {dossier?.titre}</h1>

        {erreur && <div className="alert-error">{erreur}</div>}
        {succès && <div className="alert-success">{succès}</div>}

        {/* KPI */}
        <div className="dossier-kpi">
          <div className="kpi-card positive">
            <span>Entrées</span>
            <strong>{formatCurrency(dossier?.revenuFinal)}</strong>
          </div>
          <div className="kpi-card negative">
            <span>Sorties</span>
            <strong>{formatCurrency(dossier?.coutTotal)}</strong>
          </div>
          <div className="kpi-card capital">
            <span>Solde</span>
            <strong>
              {formatCurrency(
                (dossier?.revenuFinal ?? 0) - (dossier?.coutTotal ?? 0),
              )}
            </strong>
          </div>
          <div className="kpi-card rentabilite">
            <span>Rentabilité</span>
            <strong>{dossier?.rentabilite?.toFixed(1)} %</strong>
          </div>
        </div>

        {/* ─── CHRONOMÈTRE ─── */}
        <section className="detail-section chrono-section">
          <h2>
            <FontAwesomeIcon icon={faClock} />
            Chronomètre
          </h2>

          <div className="chrono-display">
            <div className={`chrono-time ${chronoRunning ? "running" : ""}`}>
              {formatChrono(chronoSeconds)}
            </div>

            <div className="chrono-controls">
              {!chronoRunning ? (
                <button
                  className="chrono-btn start"
                  onClick={handleChronoStart}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Démarrer
                </button>
              ) : (
                <button
                  className="chrono-btn pause"
                  onClick={handleChronomPause}
                >
                  <FontAwesomeIcon icon={faPause} />
                  Pause & Sauvegarder
                </button>
              )}
              <button
                className="chrono-btn reset"
                onClick={handleChronoReset}
                disabled={chronoSeconds === 0 && !chronoRunning}
              >
                <FontAwesomeIcon icon={faRotateLeft} />
                Reset
              </button>
            </div>

            <div className="chrono-total">
              <FontAwesomeIcon icon={faClock} />
              <span>
                Temps total accumulé :{" "}
                <strong>{formatTempsTotal(dossier?.tempsTotal)}</strong>
              </span>
            </div>
          </div>
        </section>

        {/* FORMULAIRE DOSSIER */}
        <section className="detail-section">
          <h2>Informations du dossier</h2>
          <form onSubmit={handleSubmit} className="case-form">
            <div className="form-field">
              <label>Titre</label>
              <input
                name="titre"
                value={form.titre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Client</label>
              <input
                name="client"
                value={form.client}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Statut</label>
              <select name="statut" value={form.statut} onChange={handleChange}>
                <option value="en_cours">En cours</option>
                <option value="attente">Attente de pièce justificative</option>
                <option value="termine">Terminé</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
            <div className="form-field">
              <label>Date d'échéance</label>
              <input
                type="date"
                name="dateEcheance"
                value={form.dateEcheance}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Temps total (heures)</label>
              <input
                type="number"
                name="tempsTotal"
                value={form.tempsTotal}
                onChange={handleChange}
              />
            </div>
            <div className="button-submit">
              <button type="submit">Enregistrer les modifications</button>
            </div>
          </form>
        </section>

        {/* ÉTAPES */}
        <section className="detail-section">
          <div className="section-header">
            <h2>
              <FontAwesomeIcon icon={faFlag} /> Étapes & Jalons
            </h2>
            <button
              className="add-btn"
              onClick={() => setShowEtapeForm(!showEtapeForm)}
            >
              <FontAwesomeIcon icon={faPlus} />
              {showEtapeForm ? "Annuler" : "Ajouter"}
            </button>
          </div>

          {etapes.length > 0 && (
            <div className="progression">
              <div className="progression-header">
                <span>Avancement</span>
                <span>{progression}%</span>
              </div>
              <div className="progression-bar">
                <div
                  className="progression-fill"
                  style={{ width: `${progression}%` }}
                />
              </div>
              <p className="progression-label">
                {etapes.filter((e) => e.faite).length} / {etapes.length} étapes
                complétées
              </p>
            </div>
          )}

          {showEtapeForm && (
            <form onSubmit={handleAddEtape} className="op-form">
              <div className="form-field">
                <label>Titre de l'étape *</label>
                <input
                  type="text"
                  value={newEtape.titre}
                  onChange={(e) =>
                    setNewEtape({ ...newEtape, titre: e.target.value })
                  }
                  placeholder="Ex: Envoi des documents..."
                  required
                />
              </div>
              <div className="form-field">
                <label>Date butoir</label>
                <input
                  type="date"
                  value={newEtape.dateButoir}
                  onChange={(e) =>
                    setNewEtape({ ...newEtape, dateButoir: e.target.value })
                  }
                />
              </div>
              <div className="button-submit">
                <button type="submit" disabled={etapeLoading}>
                  {etapeLoading ? "Ajout..." : "Ajouter l'étape"}
                </button>
              </div>
            </form>
          )}

          {etapes.length === 0 ? (
            <div className="empty-state">
              <p>🚩 Aucune étape définie pour ce dossier.</p>
              <p>Ajoutez des jalons pour suivre l'avancement.</p>
            </div>
          ) : (
            <div className="etapes-list">
              {etapes.map((etape) => (
                <div
                  key={etape._id}
                  className={`etape-item ${etape.faite ? "faite" : ""}`}
                >
                  <button
                    className="etape-check"
                    onClick={() => handleToggleEtape(etape)}
                  >
                    {etape.faite && <FontAwesomeIcon icon={faCheck} />}
                  </button>
                  <div className="etape-info">
                    <span className="etape-titre">{etape.titre}</span>
                    {etape.dateButoir && (
                      <span className="etape-date">
                        📅 {formatDate(etape.dateButoir)}
                      </span>
                    )}
                  </div>
                  <button
                    className="op-delete"
                    onClick={() => handleDeleteEtape(etape._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* OPÉRATIONS */}
        <section className="detail-section">
          <div className="section-header">
            <h2>Opérations financières</h2>
            <button
              className="add-btn"
              onClick={() => setShowOpForm(!showOpForm)}
            >
              <FontAwesomeIcon icon={faPlus} />
              {showOpForm ? "Annuler" : "Ajouter"}
            </button>
          </div>

          {showOpForm && (
            <form onSubmit={handleAddOperation} className="op-form">
              <div className="form-field">
                <label>Type</label>
                <select
                  value={newOp.type}
                  onChange={(e) => setNewOp({ ...newOp, type: e.target.value })}
                >
                  <option value="entree">Entrée</option>
                  <option value="sortie">Sortie</option>
                </select>
              </div>
              <div className="form-field">
                <label>Montant (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newOp.montant}
                  onChange={(e) =>
                    setNewOp({ ...newOp, montant: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label>Description</label>
                <input
                  type="text"
                  value={newOp.description}
                  onChange={(e) =>
                    setNewOp({ ...newOp, description: e.target.value })
                  }
                  placeholder="Ex: Acompte client, Achat matériel..."
                />
              </div>
              <div className="form-field">
                <label>Date</label>
                <input
                  type="date"
                  value={newOp.date}
                  onChange={(e) => setNewOp({ ...newOp, date: e.target.value })}
                />
              </div>
              <div className="button-submit">
                <button type="submit" disabled={opLoading}>
                  {opLoading ? "Ajout..." : "Ajouter l'opération"}
                </button>
              </div>
            </form>
          )}

          {operations.length === 0 ? (
            <div className="empty-state">
              <p>💰 Aucune opération pour ce dossier.</p>
              <p>
                Cliquez sur Ajouter pour enregistrer une entrée ou une sortie.
              </p>
            </div>
          ) : (
            <div className="operations-list">
              {operations.map((op) => (
                <div key={op._id} className={`operation-item ${op.type}`}>
                  <div className="op-icon">
                    <FontAwesomeIcon
                      icon={
                        op.type === "entree" ? faArrowTrendUp : faArrowTrendDown
                      }
                    />
                  </div>
                  <div className="op-info">
                    <span className="op-description">
                      {op.description || "Sans description"}
                    </span>
                    <span className="op-date">{formatDate(op.date)}</span>
                  </div>
                  <div className="op-montant">
                    {op.type === "entree" ? "+" : "-"}
                    {formatCurrency(op.montant)}
                  </div>
                  <button
                    className="op-delete"
                    onClick={() => handleDeleteOperation(op._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        <div className="btn-action">
          {dossier?.statut === "en_cours" && (
            <button className="close-btn" onClick={handleCloturer}>
              Clôturer le dossier
            </button>
          )}

          {dossier?.statut === "termine" && (
            <div className="alert-success">✅ Ce dossier est clôturé</div>
          )}
        </div>
      </div>
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

export default CaseDetail;
