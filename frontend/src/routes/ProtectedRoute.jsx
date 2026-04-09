import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace/>;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "VENDOR") {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (user.role === "DELIVERY") {
      return <Navigate to="/delivery/dashboard" replace />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;