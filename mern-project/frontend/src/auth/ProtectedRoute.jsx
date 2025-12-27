// components/ProtectedLayout.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
