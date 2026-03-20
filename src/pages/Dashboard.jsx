import React, { useState } from "react";
import Header from "../components/Header";
import MenuLeft from "../components/MenuLeft";
import Footer from "../components/Footer";

const Dashboard = () => {
  const [layout, setLayout] = useState("grid-3");

  return (
    <div className="flux">
      <Header />

      {/* Menu sur la gauche */}
      <div className="body-dashboard">
        <MenuLeft />

        {/* Affichage central */}
        <div className="dashboard-user">
          <div className="layout-controls">
            <button onClick={() => setLayout("grid-2")}>2 colonnes</button>
            <button onClick={() => setLayout("grid-3")}>3 colonnes</button>
            <button onClick={() => setLayout("grid-4")}>4 colonnes</button>
            <button onClick={() => setLayout("list")}>Liste</button>
          </div>

          {/* Finance Summary */}
          <section className={`finance-summary ${layout}`}>
            <h2>Statistiques</h2>
            <article className="card capital">
              <h3>Capital total</h3>
              <p>2 450 €</p>
            </article>

            <article className="card positive">
              <h3>Entrées</h3>
              <p>+ 3 200 €</p>
            </article>

            <article className="card negative">
              <h3>Sorties</h3>
              <p>- 750 €</p>
            </article>
          </section>

          {/* Cases */}
          <section className="cases">
            <h2>Liste des dossiers</h2>

            <ul className={`cases-list ${layout}`}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <li key={item}>
                  <article className="cases-card">
                    <h3>Dossier #{item}</h3>
                    <p>Client : Nom Client</p>
                  </article>
                </li>
              ))}
            </ul>
          </section>

          {/* Stats */}
          <section className={`stats-summary ${layout}`}>
            <h2>Opérations</h2>
            <article className="stat-card capital">
              <h3>Total des opérations</h3>
              <p>125</p>
            </article>

            <article className="stat-card positive">
              <h3>Total entrées</h3>
              <p>+ 12 450 €</p>
            </article>

            <article className="stat-card negative">
              <h3>Total sorties</h3>
              <p>- 4 200 €</p>
            </article>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
