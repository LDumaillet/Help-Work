import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmer",
  confirmColor = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="confirm-modal-title">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className={`confirm-icon ${confirmColor}`}
            />
            <h2>{title}</h2>
          </div>
          <button className="modal-close" onClick={onCancel}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button className={`btn-confirm ${confirmColor}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
