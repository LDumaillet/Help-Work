import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationContext } from "./NotificationContext";
import { useAuth } from "./useAuth";
import API_URL from "../config";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { token } = useAuth();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Récupère les notifications snoozées depuis le localStorage
  const getSnoozed = () => {
    const stored = localStorage.getItem("notif_snoozed");
    return stored ? JSON.parse(stored) : {};
  };

  // Vérifie si une notification est snoozée et pas encore expirée
  const isSnoozed = (id) => {
    const snoozed = getSnoozed();
    if (!snoozed[id]) return false;
    return new Date(snoozed[id]) > new Date();
  };

  // Snooze une notification jusqu'à une date donnée
  const snoozeNotification = (id, until) => {
    const snoozed = getSnoozed();
    snoozed[id] = until;
    localStorage.setItem("notif_snoozed", JSON.stringify(snoozed));
    // Retire immédiatement du panneau
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Valider = snooze jusqu'à demain matin
  const dismissNotification = (id) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    snoozeNotification(id, tomorrow.toISOString());
  };

  // Snooze personnalisé
  const snoozeFor = (id, days) => {
    const until = new Date();
    until.setDate(until.getDate() + days);
    until.setHours(8, 0, 0, 0);
    snoozeNotification(id, until.toISOString());
  };

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/dossiers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dossiers = await res.json();
      if (!res.ok) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const alerts = [];

      dossiers.forEach((d) => {
        if (d.statut === "termine" || d.statut === "archive") return;

        if (d.dateEcheance) {
          const echeance = new Date(d.dateEcheance);
          echeance.setHours(0, 0, 0, 0);
          const diffJours = Math.ceil(
            (echeance - today) / (1000 * 60 * 60 * 24),
          );

          if (diffJours < 0) {
            alerts.push({
              id: `late-${d._id}`,
              type: "danger",
              dossierId: d._id,
              titre: d.titre,
              message: `Échéance dépassée de ${Math.abs(diffJours)} jour(s)`,
            });
          } else if (diffJours === 0) {
            alerts.push({
              id: `today-${d._id}`,
              type: "warning",
              dossierId: d._id,
              titre: d.titre,
              message: "Échéance aujourd'hui !",
            });
          } else if (diffJours <= 3) {
            alerts.push({
              id: `soon-${d._id}`,
              type: "warning",
              dossierId: d._id,
              titre: d.titre,
              message: `Échéance dans ${diffJours} jour(s)`,
            });
          } else if (diffJours <= 7) {
            alerts.push({
              id: `week-${d._id}`,
              type: "info",
              dossierId: d._id,
              titre: d.titre,
              message: `Échéance dans ${diffJours} jours`,
            });
          }
        }

        if (d.rentabilite < 0) {
          alerts.push({
            id: `rent-${d._id}`,
            type: "danger",
            dossierId: d._id,
            titre: d.titre,
            message: `Rentabilité négative : ${d.rentabilite.toFixed(1)}%`,
          });
        }

        if (d.rentabilite >= 0 && d.rentabilite < 100 && d.coutTotal > 0) {
          alerts.push({
            id: `lowrent-${d._id}`,
            type: "info",
            dossierId: d._id,
            titre: d.titre,
            message: `Rentabilité faible : ${d.rentabilite.toFixed(1)}%`,
          });
        }
      });

      // Filtre les notifications snoozées
      const filtered = alerts.filter((a) => !isSnoozed(a.id));

      if (isMounted.current) {
        setNotifications(filtered);
      }
    } catch {
      // Silencieux
    }
  }, [token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchNotifications();
    }, 0);
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        dismissNotification,
        snoozeFor,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
