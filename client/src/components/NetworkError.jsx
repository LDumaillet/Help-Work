import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi, faRotateRight } from "@fortawesome/free-solid-svg-icons";

const NetworkError = ({ onRetry }) => {
  return (
    <div className="network-error">
      <div className="network-error-icon">
        <FontAwesomeIcon icon={faWifi} />
      </div>
      <h3>Serveur inaccessible</h3>
      <p>
        Impossible de contacter le serveur. Vérifiez votre connexion internet ou
        réessayez dans quelques instants.
      </p>
      {onRetry && (
        <button className="network-error-btn" onClick={onRetry}>
          <FontAwesomeIcon icon={faRotateRight} />
          Réessayer
        </button>
      )}
    </div>
  );
};

export default NetworkError;
