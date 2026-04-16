import React, { useMemo } from "react";
import Header from "../components/Header";
import MenuLeft from "../components/MenuLeft";
import Footer from "../components/Footer";

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

const Stats = () => {
  const casesData = [
    { id: 1, client: "Dupont", status: "En cours", amount: 1200 },
    { id: 2, client: "Martin", status: "Terminé", amount: 850 },
    { id: 3, client: "Bernard", status: "En attente", amount: 430 },
    { id: 4, client: "Petit", status: "En cours", amount: 2100 },
    { id: 5, client: "Robert", status: "Terminé", amount: 670 },
    { id: 6, client: "Richard", status: "En cours", amount: 990 },
    { id: 7, client: "Durand", status: "En attente", amount: 1500 },
    { id: 8, client: "Moreau", status: "Terminé", amount: 300 },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  const stats = useMemo(() => {
    const total = casesData.length;
    const totalAmount = casesData.reduce((sum, c) => sum + c.amount, 0);
    const inProgress = casesData.filter((c) => c.status === "En cours").length;
    const completed = casesData.filter((c) => c.status === "Terminé").length;
    const pending = casesData.filter((c) => c.status === "En attente").length;
    const average = totalAmount / total;

    return {
      total,
      totalAmount,
      inProgress,
      completed,
      pending,
      average,
    };
  }, []);

  // Data pour Pie Chart
  const pieData = [
    { name: "En cours", value: stats.inProgress },
    { name: "Terminé", value: stats.completed },
    { name: "En attente", value: stats.pending },
  ];

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b"];

  return (
    <div className="flux">
      <Header />
      <div className="body-dashboard">
        <MenuLeft />

        <div className="dashboard-user full">
          <h1>Statistiques</h1>

          {/* KPI */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total dossiers</h3>
              <p>{stats.total}</p>
            </div>
            <div className="stat-card">
              <h3>Chiffre d'affaires</h3>
              <p>{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="stat-card">
              <h3>Panier moyen</h3>
              <p>{formatCurrency(stats.average)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Bar Chart */}
            <div className="chart-card">
              <h3>Montant par client</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={casesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="client" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="amount"
                    name="Montant"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Stats;
