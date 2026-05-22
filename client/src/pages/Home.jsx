import React from "react";
import Header from "../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import {
  faChartPie,
  faClipboardList,
  faWallet,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import followUp from "../assets/follow-up.webp";
import caseImg from "../assets/case.webp";
import dashboard from "../assets/dashboard.webp";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Home = () => {
  const { user } = useAuth();
  const features = [
    "Suivi d'avancement clair",
    "Dates clés et d'échéances",
    "Temps passés",
    "Coûts engagés",
    "Revenu final",
  ];

  return (
    <div className="flux">
      <Header />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <img src="/logo.webp" alt="logo Help Work" className="hero-logo" />
          <div className="hero-text">
            <h1>
              Bienvenue sur <span>Help Work</span>
            </h1>
            <p>
              La solution tout-en-un pour suivre vos dossiers, gérer vos
              finances et analyser votre rentabilité en temps réel.
            </p>
            <div className="hero-actions">
              {user ? (
                // Utilisateur connecté
                <>
                  <Link to="/dashboard" className="btn-primary">
                    Accéder à mon dashboard
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                  <Link to="/cases" className="btn-secondary">
                    Mes dossiers
                  </Link>
                </>
              ) : (
                // Utilisateur non connecté
                <>
                  <Link to="/registration" className="btn-primary">
                    Commencer gratuitement
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                  <Link to="/connect" className="btn-secondary">
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features">
        {/* Feature 1 */}
        <div className="feature-block">
          <div className="feature-content">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faChartPie} />
            </div>
            <h2>Vos statistiques en temps réel</h2>
            <p>
              Suivez l'avancement de vos dossiers, respectez les délais clés et
              analysez leur impact financier. Help Work centralise les coûts,
              les revenus et l'état d'avancement pour une vision claire et
              structurée.
            </p>
          </div>
          <div className="feature-img">
            <img src={followUp} alt="Graphique de suivi" />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature-block reverse">
          <div className="feature-content">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <h2>Suivi de dossiers & gestion financière</h2>
            <p>
              Facilitez le suivi de vos dossiers avec des délais à respecter,
              tout en ayant une vue précise de leur rentabilité. Suivez chaque
              dossier étape par étape avec ses échéances, ses coûts et ses
              revenus.
            </p>
          </div>
          <div className="feature-img">
            <img src={caseImg} alt="Recherche de dossier" />
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-block">
          <div className="feature-content">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faClipboardList} />
            </div>
            <h2>À votre disposition</h2>
            <ul className="feature-list">
              {features.map((f, i) => (
                <li key={i}>
                  <FontAwesomeIcon icon={faCircleCheck} />
                  {f}
                </li>
              ))}
            </ul>
            <p>
              Help Work calcule automatiquement les indicateurs financiers
              essentiels et vous offre des tableaux de bord pour une vision
              globale de votre activité.
            </p>
          </div>
          <div className="feature-img">
            <img src={dashboard} alt="Suivi des statistiques" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="cta-card">
          <h2>Prêt à optimiser votre activité ?</h2>
          <p>
            Rejoignez Help Work et prenez le contrôle de vos dossiers dès
            aujourd'hui.
          </p>
          <Link to="/registration" className="btn-primary">
            Créer un compte gratuit
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
