import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ActivityLog from "./pages/ActivityLog";
import ClientsFollow from "./pages/ClientsFollow";
import SalesMembers from "./pages/SalesMembers";
import AccessControl from "./pages/AccessControl";
import AddClient from "./pages/AddClient";
import Login from "./pages/Login";
import EmployeeActivity from "./pages/EmployeeActivity";
import EmployeeTracking from "./pages/EmployeeTracking";

/* 🔐 PROTECTED LAYOUT */
const ProtectedLayout = () => {
  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Invalid user data", err);
    localStorage.removeItem("user");
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="content-area">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/clients-follow" element={<ClientsFollow />} />
          <Route path="/sales-members" element={<SalesMembers />} />
          <Route path="/access-control" element={<AccessControl />} />
          <Route path="/add-client" element={<AddClient />} />
          <Route path="/employee-activity/:name" element={<EmployeeActivity />} />
          <Route path="/employee-tracking" element={<EmployeeTracking />} />
          <Route path="/employee-tracking/:name" element={<EmployeeTracking />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>

      {/* 🌐 DEFAULT → LOGIN */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 🔓 LOGIN PAGE */}
      <Route path="/login" element={<Login />} />

      {/* 🔐 ALL PROTECTED ROUTES */}
      <Route path="/*" element={<ProtectedLayout />} />

      {/* 🚫 FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;
