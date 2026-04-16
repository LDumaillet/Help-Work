import "./styles/index.scss";
import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthProviders.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
