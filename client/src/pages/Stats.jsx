import React, { useMemo, useState, useEffect } from "react";
import Header from "../components/Header";
import MenuLeft from "../components/MenuLeft";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import SkeletonCard from "../components/SkeletonCard";
import SkeletonKpi from "../components/SkeletonKpi";

const Stats = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [periode, setPeriode] = useState("total");
  const [moisSelectionne, setMoisSelectionne] = useState(new Date().getMonth());
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(
    new Date().getFullYear(),
  );
  const { token } = useAuth();

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await fetch("/api/dossiers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setDossiers(data);
      } catch {
        setErreur("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchDossiers();
  }, [token]);

  // Années disponibles basées sur les dossiers
  const anneesDisponibles = useMemo(() => {
    const annees = dossiers.map((d) => new Date(d.createdAt).getFullYear());
    return [...new Set(annees)].sort((a, b) => b - a);
  }, [dossiers]);

  const moisLabels = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  // Filtre les dossiers selon la période
  const dossiersFiltres = useMemo(() => {
    if (periode === "total") return dossiers;

    return dossiers.filter((d) => {
      const date = new Date(d.createdAt);
      if (periode === "annee") {
        return date.getFullYear() === anneeSelectionnee;
      }
      if (periode === "mois") {
        return (
          date.getFullYear() === anneeSelectionnee &&
          date.getMonth() === moisSelectionne
        );
      }
      return true;
    });
  }, [dossiers, periode, moisSelectionne, anneeSelectionnee]);

  const formatCurrency = (value) => {
    return (
      value
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €"
    );
  };

  const stats = useMemo(() => {
    const total = dossiersFiltres.length;
    const totalRevenu = dossiersFiltres.reduce(
      (sum, d) => sum + d.revenuFinal,
      0,
    );
    const totalCout = dossiersFiltres.reduce((sum, d) => sum + d.coutTotal, 0);
    const inProgress = dossiersFiltres.filter(
      (d) => d.statut === "en_cours",
    ).length;
    const completed = dossiersFiltres.filter(
      (d) => d.statut === "termine",
    ).length;
    const archived = dossiersFiltres.filter(
      (d) => d.statut === "archive",
    ).length;
    const average = total > 0 ? totalRevenu / total : 0;
    const rentabiliteMoyenne =
      total > 0
        ? dossiersFiltres.reduce((sum, d) => sum + d.rentabilite, 0) / total
        : 0;

    return {
      total,
      totalRevenu,
      totalCout,
      inProgress,
      completed,
      archived,
      average,
      rentabiliteMoyenne,
    };
  }, [dossiersFiltres]);

  const pieData = [
    { name: "En cours", value: stats.inProgress },
    { name: "Terminé", value: stats.completed },
    { name: "Archivé", value: stats.archived },
  ];

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

  const barData = dossiersFiltres.map((d) => ({
    name: d.client || d.titre,
    revenu: d.revenuFinal,
    cout: d.coutTotal,
  }));

  const getPeriodeLabel = () => {
    if (periode === "total") return "Toutes les périodes";
    if (periode === "annee") return `Année ${anneeSelectionnee}`;
    return `${moisLabels[moisSelectionne]} ${anneeSelectionnee}`;
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    const dateExport = new Date().toLocaleDateString("fr-FR");

    // ─── COULEURS ───────────────────────────────────────────
    const kakiColor = [88, 91, 76];
    const beigeColor = [130, 109, 98];
    const whiteColor = [255, 255, 255];
    const greyLight = [245, 245, 245];
    // const blackColor = [42, 44, 36];

    // ─── LOGO EN BASE64 ─────────────────────────────────────
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

    // ─── EN-TÊTE ────────────────────────────────────────────
    doc.setFillColor(...kakiColor);
    doc.rect(0, 0, 210, 45, "F");

    // Logo rond
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 10, 5, 35, 35);
    }

    // Titre
    doc.setTextColor(...whiteColor);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HELP WORK", 52, 18);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Rapport de statistiques globales", 52, 27);
    doc.text(`Exporté le ${dateExport}`, 52, 35);

    // ─── TITRE DE LA PÉRIODE ────────────────────────────────
    doc.setFillColor(...beigeColor);
    doc.rect(0, 45, 210, 10, "F");
    doc.setTextColor(...whiteColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Période : ${getPeriodeLabel()}`, 14, 52);

    // ─── KPI GLOBAUX ────────────────────────────────────────
    const yKpi = 65;

    doc.setTextColor(...kakiColor);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Indicateurs clés", 14, yKpi);

    autoTable(doc, {
      startY: yKpi + 6,
      head: [["Indicateur", "Valeur"]],
      body: [
        ["Total dossiers", `${stats.total} dossier(s)`],
        ["Chiffre d'affaires", formatCurrency(stats.totalRevenu)],
        ["Coûts totaux", formatCurrency(stats.totalCout)],
        ["Solde net", formatCurrency(stats.totalRevenu - stats.totalCout)],
        ["Revenu moyen / dossier", formatCurrency(stats.average)],
        ["Rentabilité moyenne", `${stats.rentabiliteMoyenne.toFixed(1)} %`],
        ["Dossiers en cours", `${stats.inProgress} dossier(s)`],
        ["Dossiers terminés", `${stats.completed} dossier(s)`],
        ["Dossiers archivés", `${stats.archived} dossier(s)`],
      ],
      theme: "grid",
      headStyles: {
        fillColor: kakiColor,
        textColor: whiteColor,
        fontStyle: "bold",
        fontSize: 10,
      },
      alternateRowStyles: { fillColor: greyLight },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 100 },
        1: { cellWidth: 80, halign: "right" },
      },
    });

    // ─── RÉPARTITION DES STATUTS ────────────────────────────
    const yStatuts = doc.lastAutoTable.finalY + 14;

    doc.setFillColor(...kakiColor);
    doc.rect(0, yStatuts - 6, 210, 10, "F");
    doc.setTextColor(...whiteColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Répartition des dossiers par statut", 14, yStatuts + 1);

    const total = stats.total || 1;
    autoTable(doc, {
      startY: yStatuts + 8,
      head: [["Statut", "Nombre", "Pourcentage"]],
      body: [
        [
          "En cours",
          `${stats.inProgress} dossier(s)`,
          `${Math.round((stats.inProgress / total) * 100)} %`,
        ],
        [
          "Terminé",
          `${stats.completed} dossier(s)`,
          `${Math.round((stats.completed / total) * 100)} %`,
        ],
        [
          "Archivé",
          `${stats.archived} dossier(s)`,
          `${Math.round((stats.archived / total) * 100)} %`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: kakiColor,
        textColor: whiteColor,
        fontStyle: "bold",
        fontSize: 10,
      },
      alternateRowStyles: { fillColor: greyLight },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: "center" },
        2: { cellWidth: 50, halign: "center" },
      },
    });

    // ─── DÉTAIL PAR DOSSIER ─────────────────────────────────
    if (dossiersFiltres.length > 0) {
      const yDetail = doc.lastAutoTable.finalY + 14;

      doc.setFillColor(...beigeColor);
      doc.rect(0, yDetail - 6, 210, 10, "F");
      doc.setTextColor(...whiteColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Détail par dossier", 14, yDetail + 1);

      const statutLabels = {
        en_cours: "En cours",
        attente: "Attente",
        termine: "Terminé",
        archive: "Archivé",
      };

      autoTable(doc, {
        startY: yDetail + 8,
        head: [
          ["Dossier", "Client", "Statut", "Revenu", "Coût", "Rentabilité"],
        ],
        body: dossiersFiltres.map((d) => [
          d.titre,
          d.client || "—",
          statutLabels[d.statut] || d.statut,
          formatCurrency(d.revenuFinal),
          formatCurrency(d.coutTotal),
          `${d.rentabilite?.toFixed(1)} %`,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: beigeColor,
          textColor: whiteColor,
          fontStyle: "bold",
          fontSize: 9,
        },
        alternateRowStyles: { fillColor: greyLight },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 35 },
          2: { cellWidth: 28 },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 30, halign: "right" },
          5: { cellWidth: 22, halign: "center" },
        },
      });
    }

    // ─── PIED DE PAGE ────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Ligne de séparation
      doc.setDrawColor(...kakiColor);
      doc.setLineWidth(0.5);
      doc.line(14, 282, 196, 282);

      doc.setFillColor(...kakiColor);
      doc.rect(0, 284, 210, 14, "F");

      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 10, 285, 10, 10);
      }

      doc.setTextColor(...whiteColor);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Help Work", 23, 291);

      doc.setFont("helvetica", "normal");
      doc.text("— Rapport généré automatiquement", 44, 291);
      doc.text(`Page ${i} / ${pageCount}`, 190, 291, { align: "right" });
    }

    // ─── SAUVEGARDE ─────────────────────────────────────────
    const periodeFileName =
      periode === "total"
        ? "total"
        : periode === "annee"
          ? `${anneeSelectionnee}`
          : `${moisLabels[moisSelectionne]}-${anneeSelectionnee}`;

    doc.save(
      `helpwork-stats-${periodeFileName}-${dateExport.replace(/\//g, "-")}.pdf`,
    );
  };

  return (
    <div className="flux">
      <Header />
      <div className="body-dashboard">
        <MenuLeft />

        <div className="dashboard-user full">
          <div className="stats-page-header">
            <h1>Statistiques</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="stats-periode-label">{getPeriodeLabel()}</span>
              {!loading && !erreur && dossiersFiltres.length > 0 && (
                <button className="export-btn" onClick={exportPDF}>
                  <FontAwesomeIcon icon={faFilePdf} />
                  Exporter PDF
                </button>
              )}
            </div>
          </div>

          {loading && (
            <>
              <SkeletonKpi count={6} />
              <div className="charts-grid">
                <div className="skeleton-section" style={{ height: "340px" }}>
                  <div
                    className="skeleton-line title"
                    style={{ width: "40%" }}
                  />
                  <div
                    className="skeleton-line"
                    style={{ flex: 1, height: "260px", borderRadius: "12px" }}
                  />
                </div>
                <div className="skeleton-section" style={{ height: "340px" }}>
                  <div
                    className="skeleton-line title"
                    style={{ width: "40%" }}
                  />
                  <div
                    className="skeleton-line"
                    style={{ flex: 1, height: "260px", borderRadius: "12px" }}
                  />
                </div>
              </div>
            </>
          )}
          {erreur && <p className="alert-error">{erreur}</p>}

          {!loading && !erreur && (
            <>
              {/* FILTRE PÉRIODE */}
              <div className="stats-filters">
                <div className="periode-tabs">
                  <button
                    className={`periode-tab ${periode === "total" ? "active" : ""}`}
                    onClick={() => setPeriode("total")}
                  >
                    Total
                  </button>
                  <button
                    className={`periode-tab ${periode === "annee" ? "active" : ""}`}
                    onClick={() => setPeriode("annee")}
                  >
                    Par année
                  </button>
                  <button
                    className={`periode-tab ${periode === "mois" ? "active" : ""}`}
                    onClick={() => setPeriode("mois")}
                  >
                    Par mois
                  </button>
                </div>

                {/* Sélecteurs année et mois */}
                {(periode === "annee" || periode === "mois") && (
                  <div className="periode-selectors">
                    <select
                      value={anneeSelectionnee}
                      onChange={(e) =>
                        setAnneeSelectionnee(Number(e.target.value))
                      }
                    >
                      {anneesDisponibles.length > 0 ? (
                        anneesDisponibles.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))
                      ) : (
                        <option value={new Date().getFullYear()}>
                          {new Date().getFullYear()}
                        </option>
                      )}
                    </select>

                    {periode === "mois" && (
                      <select
                        value={moisSelectionne}
                        onChange={(e) =>
                          setMoisSelectionne(Number(e.target.value))
                        }
                      >
                        {moisLabels.map((m, i) => (
                          <option key={i} value={i}>
                            {m}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* KPI */}
              {dossiersFiltres.length === 0 ? (
                <div className="empty-state">
                  <p>📊 Aucun dossier pour cette période.</p>
                  <p>
                    Essayez une autre période ou créez de nouveaux dossiers.
                  </p>
                </div>
              ) : (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h3>Total dossiers</h3>
                      <p>{stats.total}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Chiffre d'affaires</h3>
                      <p>{formatCurrency(stats.totalRevenu)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Coûts totaux</h3>
                      <p>{formatCurrency(stats.totalCout)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Revenu moyen</h3>
                      <p>{formatCurrency(stats.average)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Rentabilité moyenne</h3>
                      <p>{stats.rentabiliteMoyenne.toFixed(1)} %</p>
                    </div>
                    <div className="stat-card">
                      <h3>En cours</h3>
                      <p>{stats.inProgress}</p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="charts-grid">
                    <div className="chart-card">
                      <h3>Revenu vs Coût par dossier</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                          />
                          <Bar
                            dataKey="revenu"
                            name="Revenu"
                            fill="#3b82f6"
                            radius={[8, 8, 0, 0]}
                          />
                          <Bar
                            dataKey="cout"
                            name="Coût"
                            fill="#f87171"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                      <h3>Répartition des statuts</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={index} fill={COLORS[index]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Stats;
