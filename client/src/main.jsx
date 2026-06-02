import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProviders.jsx";
import { NotificationProvider } from "./context/NotificationProvider.jsx";
import "./styles/index.scss";
import CookieBanner from "./components/CookieBanner.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
        <CookieBanner />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
);
