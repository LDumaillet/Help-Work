import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import MenuLeft from "../components/MenuLeft";
import Footer from "../components/Footer";

const Cases = () => {
  const [layout, setLayout] = useState("grid-3");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

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

  const filteredCases = useMemo(() => {
    let data = [...casesData];

    if (search) {
      data = data.filter((c) =>
        c.client.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter) {
      data = data.filter((c) => c.status === statusFilter);
    }

    if (sortBy === "amount-asc") {
      data.sort((a, b) => a.amount - b.amount);
    }

    if (sortBy === "amount-desc") {
      data.sort((a, b) => b.amount - a.amount);
    }

    if (sortBy === "client") {
      data.sort((a, b) => a.client.localeCompare(b.client));
    }

    return data;
  }, [search, statusFilter, sortBy]);

  return (
    <div className="flux">
      <Header />

      <div className="body-dashboard">
        <MenuLeft />

        {/* CONTENT */}
        <div className="dashboard-user full">
          <div className="cases-header">
            <h1>Gestion des Dossiers</h1>
            <span className="count">{filteredCases.length} dossier(s)</span>
          </div>

          {/* FILTER BAR */}
          <div className="cases-controls">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tous statuts</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="En attente">En attente</option>
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
            </div>
          </div>

          {/* CASES GRID */}
          <div className={`cases-grid ${layout}`}>
            {filteredCases.map((item) => (
              <div key={item.id} className="cases-card">
                <div className="card-header">
                  <h3>Dossier #{item.id}</h3>
                  <span
                    className={`status ${item.status
                      .replace(" ", "-")
                      .toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </div>

                <p>
                  <strong>Client :</strong> {item.client}
                </p>
                <p>
                  <strong>Montant :</strong> {formatCurrency(item.amount)}
                </p>

                <button className="details-btn">Voir le dossier</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cases;
