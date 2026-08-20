import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

const AdminProtectedRoute = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const role =
    user?.role?.name;

  if (role !== "admin") {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }

  return <Outlet />;
};

export default AdminProtectedRoute;