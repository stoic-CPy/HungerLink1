import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Wrap any route element with this. If `role` is passed, only that role
// may view the route - anyone else is redirected to their own dashboard
// (or to /login if not authenticated at all).
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="route-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "donor" ? "/donor" : "/ngo"} replace />;
  }

  return children;
}
