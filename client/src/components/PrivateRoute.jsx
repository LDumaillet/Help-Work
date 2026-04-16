import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  return token ? children : <Navigate to="/connect" replace />;
};

export default PrivateRoute;
