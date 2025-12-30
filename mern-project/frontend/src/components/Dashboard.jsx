import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import UserMenu from "../components/UserMenu.jsx";
import api from "../api/axios";


/* ================= HELPERS ================= */

const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getLoggedInUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Invalid user data");
    return null;
  }
};

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [sortedClients, setSortedClients] = useState([]);
  const [search, setSearch] = useState("");

  /* ===== Logged-in User ===== */
  const user = getLoggedInUser();

  const displayName =
    user?.role === "admin"
      ? "Zugo Private Limited"
      : user?.name || "Employee";

  const email = user?.email || "N/A";
  const role = user?.role ? user.role.toUpperCase() : "N/A";

  /* ===== Fetch Clients ===== */
  
  useEffect(() => {
  api
    .get("/api/clients")
    .then((res) => setClients(res.data))
    .catch((err) => console.log(err));
}, []);


  /* ===== Sort Clients ===== */
  useEffect(() => {
    try {
      const sorted = [...clients].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setSortedClients(sorted);
    } catch {
      setSortedClients(clients);
    }
  }, [clients]);

  /* ===== Filter Clients ===== */
  const filteredRows = useMemo(() => {
    const s = search.trim().toLowerCase();
    const normalize = (v = "") =>
      v.toString().toLowerCase().replace(/[^a-z0-9]/g, "");
    const ns = normalize(s);

    const augmented = sortedClients.map((c, idx) => ({
      __displayIndex: idx + 1,
      __displayId: (c.customerId || String(idx + 1)).toString(),
      ...c,
    }));

    if (!s) return augmented;

    return augmented.filter((c) => {
      const name = normalize(c.name);
      const cid = normalize(c.customerId);
      const id = normalize(c._id);
      const displayId = normalize(c.__displayId);

      return (
        name.includes(ns) ||
        cid.includes(ns) ||
        id.includes(ns) ||
        displayId.includes(ns)
      );
    });
  }, [search, sortedClients]);

  /* ================= JSX ================= */

  return (
    <div className="dashboard-container">
      <UserMenu />
      <h1>Overview</h1>

      {/* ===== Banner ===== */}
      <div className="banner">
        <div>
          <p>{getCurrentDate()}</p>
          <h2>Welcome, {displayName}</h2>
          <h3>{email}</h3>
          <p>{role}</p>
          <button className="get-started-btn">Get Started</button>
        </div>
      </div>

      {/* ===== Recent Clients ===== */}
      <div className="recent-clients-section">
        <h2>Recent Clients</h2>

        <input
          className="search-box"
          placeholder="Search by name, customer ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table className="clients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((client) => (
              <tr key={client._id}>
                <td>{client.__displayId}</td>
                <td>{client.name}</td>
                <td>{client.phone}</td>
                <td>{client.date}</td>
                <td>{client.type}</td>
                <td>
                  <span className={`status ${client.status.toLowerCase()}`}>
                    {client.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
