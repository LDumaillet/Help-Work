import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;
