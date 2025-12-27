import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import logo from "/public/zugo.png";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const closeSidebar = () => setOpen(false);

  return (
    <>
      {/* ☰ TOGGLE BUTTON (MOBILE ONLY) */}
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* 🔲 OVERLAY (MOBILE) */}
      {open && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* 📂 SIDEBAR */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        <header className="logo-header">
      <img src={logo} alt="ZUGO Logo" className="logo-img" />
    </header>
        <nav className="menu">
  <NavLink to="/dashboard" className="menu-item" onClick={closeSidebar}>
    Dashboard
  </NavLink>

  <NavLink to="/activity" className="menu-item" onClick={closeSidebar}>
    Activity Log
  </NavLink>

  <NavLink to="/clients-follow" className="menu-item" onClick={closeSidebar}>
    Clients Follow-up
  </NavLink>

  <NavLink to="/sales-members" className="menu-item" onClick={closeSidebar}>
    Sales Members
  </NavLink>

  <NavLink to="/employee-tracking" className="menu-item" onClick={closeSidebar}>
    Employee Tracking
  </NavLink>

  {/* ✅ MOVE HERE */}
  <NavLink to="/access-control" className="menu-item" onClick={closeSidebar}>
    Access Control
  </NavLink>
</nav>

      </div>
    </>
  );
}
