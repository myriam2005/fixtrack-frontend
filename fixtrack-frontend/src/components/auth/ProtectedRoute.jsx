import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}