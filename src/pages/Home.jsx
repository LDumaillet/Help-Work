import React from "react";
import Header from "../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import {
  faChartPie,
  faClipboardList,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import followUp from "../assets/follow-up.webp";
import caseImg from "../assets/case.webp";
import dashboard from "../assets/dashboard.webp";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="flux">
      <Header />

      <div className="head-home">
        <img src="/logo.webp" alt="logo du site" />
        <h1>Bienvenue sur Help Work</h1>
      </div>

      <div className="body-home">
        <div className="content-global">
          <div className="content">
            <h2>
              <FontAwesomeIcon icon={faChartPie} />
              Vos statiques en temps réel
            </h2>
            <p>
              Cette application web permet de suivre l’avancement des dossiers,
              de respecter les délais clés et d’analyser leur impact financier.{" "}
              <br />
              Elle centralise les coûts, les revenus et l’état d’avancement pour
              offrir une vision claire et structurée de chaque dossier.
            </p>
          </div>
          <div className="content-img">
            <img src={followUp} alt="Graphique de suivi" />
          </div>
        </div>
        <div className="content-global">
          <div className="content-img">
            <img src={caseImg} alt="Recherche de dossier" />
          </div>
          <div className="content">
            <h2>
              <FontAwesomeIcon icon={faWallet} />
              Suivi de dossiers & gestion financière simplifiée
            </h2>
            <p>
              Cette application web a été conçue pour faciliter le suivi des
              dossiers avec des délais à respecter, tout en offrant une vue
              précise de leur rentabilité. <br />
              Chaque dossier peut être suivi étape par étape, avec ses
              échéances, ses coûts engagés et les revenus générés.
            </p>
          </div>
        </div>

        <div className="content-global">
          <div className="content">
            <h2>
              <FontAwesomeIcon icon={faClipboardList} /> A votre disposition
            </h2>
            <p>
              <FontAwesomeIcon icon={faCircleCheck} />
              Suivi d'avancement clair
            </p>
            <p>
              <FontAwesomeIcon icon={faCircleCheck} />
              Dates clés et d'échéances
            </p>
            <p>
              <FontAwesomeIcon icon={faCircleCheck} />
              Temps passés
            </p>
            <p>
              <FontAwesomeIcon icon={faCircleCheck} />
              Coûts engagés
            </p>
            <p>
              <FontAwesomeIcon icon={faCircleCheck} />
              Revenu final
            </p>
            <br />
            <p>
              L’application calcule automatiquement les indicateurs financiers
              essentiels tels que le coût total, le montant encaissé et la
              rentabilité par dossier. <br />
              Des tableaux de bord et graphiques permettent d’obtenir une vision
              globale de l’activité ainsi qu’un suivi détaillé dossier par
              dossier.
            </p>
          </div>
          <div className="content-img">
            <img src={dashboard} alt="Suivi des statistiques" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
