import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allow }) {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // if role restriction exists
  if (allow) {
    if (Array.isArray(allow) && !allow.includes(role)) {
      return <Navigate to="/" replace />;
    }

    if (typeof allow === "string" && role !== allow) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
