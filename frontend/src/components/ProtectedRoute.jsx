import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/staff/login" />;

  if (role && role !== userRole) return <h3>Access Denied</h3>;

  return children;
}

export default ProtectedRoute;
