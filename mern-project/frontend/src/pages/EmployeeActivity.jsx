import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/EmployeeActivity.css";
import UserMenu from "../components/UserMenu";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EmployeeActivity = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name).trim();

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDate, setFilterDate] = useState("");

  let isAdmin = false;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      isAdmin = user?.role === "admin";
    }
  } catch (err) {
    console.error("Invalid user in localStorage", err);
    localStorage.removeItem("user");
  }

  // Fetch activity records for this employee
  useEffect(() => {
    axios
      .get(
        `https://zugo-backend-trph.onrender.com/api/activity/employee/${decodedName}`
      )
      .then((res) => {
        const filtered = res.data.filter(
          (a) => a.name.toLowerCase() === decodedName.toLowerCase()
        );

        setRecords(filtered);
        setFilteredRecords(filtered);
      })
      .catch((err) => {
        console.log("Error loading employee activity:", err);
      });
  }, [decodedName]);

  // Apply month/year filters
  useEffect(() => {
    let temp = [...records];

    if (filterMonth) temp = temp.filter((r) => r.month === Number(filterMonth));
    if (filterYear) temp = temp.filter((r) => r.year === Number(filterYear));

    setFilteredRecords(temp);
  }, [filterMonth, filterYear, records]);

  const sortedGraph = [...filteredRecords].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const chartData = {
    labels: sortedGraph.map((r) => `${r.month}/${r.year}`),
    datasets: [
      {
        label: "Clients Booked",
        data: sortedGraph.map((r) => r.clients),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const totalClients = filteredRecords.reduce((sum, r) => sum + r.clients, 0);
  const bestRecord =
    filteredRecords.length > 0
      ? filteredRecords.reduce((max, r) =>
          r.clients > max.clients ? r : max
        )
      : null;

  const leaderboard = [...records]
    .sort((a, b) => b.clients - a.clients)
    .slice(0, 5);

  const [visits, setVisits] = useState([]);

  useEffect(() => {
    axios
      .get(
        `https://zugo-backend-trph.onrender.com/api/visits/employee/${decodedName}`
      )
      .then((res) => setVisits(res.data));
  }, [decodedName]);

  const deleteVisit = async (id) => {
    if (!window.confirm("Delete this visit?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await axios.delete(
        `https://zugo-backend-trph.onrender.com/api/visits/${id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setVisits((prev) => prev.filter((v) => v._id !== id));
      alert("Deleted successfully ✅");
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      alert("Delete failed ❌ ");
    }
  };

  return (
    <div className="employee-activity-container" style={{ padding: "20px" }}>
      <UserMenu />
      <h2>{decodedName}'s Activity</h2>

      {/* Filters */}
      <div
        className="filters"
        style={{ marginTop: "20px", display: "flex", gap: "15px" }}
      >
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">Filter by Month</option>
          {[
            "January","February","March","April","May","June",
            "July","August","September","October","November","December",
          ].map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>

        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">Filter by Year</option>
          {Array.from({ length: 20 }, (_, i) => 2020 + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="stats-box" style={{ marginTop: "25px" }}>
        <h3>Statistics</h3>
        <p>
          Total Clients: <b>{totalClients}</b>
        </p>
        {bestRecord && (
          <p>
            Best Month: <b>{bestRecord.month}/{bestRecord.year}</b> —{" "}
            {bestRecord.clients} clients
          </p>
        )}
      </div>

      {/* Graph */}
      <div className="graph-box" style={{ width: "70%", marginTop: "30px" }}>
        {filteredRecords.length > 0 ? (
          <Bar data={chartData} />
        ) : (
          <p>No activity found for this filter.</p>
        )}
      </div>

      {/* Activity List */}
      <div className="activity-list" style={{ marginTop: "30px" }}>
        <h3>Activity Records</h3>
        <ul>
          {filteredRecords.map((r, i) => (
            <li key={i}>
              {r.month}/{r.year} — Clients: <b>{r.clients}</b>
            </li>
          ))}
        </ul>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-box">
        <h3>Top Performance (Leaderboard)</h3>
        {leaderboard.length === 0 ? (
          <p>No data for leaderboard yet.</p>
        ) : (
          <ol>
            {leaderboard.map((r, i) => (
              <li key={i}>
                <span className="rank">{i + 1}.</span>
                <span className="month">
                  {r.month}/{r.year}
                </span>
                <span className="score">{r.clients} clients</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <h3 style={{ marginTop: 40 }}>Visit Photos</h3>

      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />

      {visits.filter((v) => {
        if (!filterDate) return true;
        return new Date(v.createdAt).toISOString().slice(0, 10) === filterDate;
      }).length === 0 && filterDate ? (
        <p style={{ marginTop: "20px", fontWeight: "bold", color: "#666" }}>
          There is no images on this day..
        </p>
      ) : (
        <div className="visit-grid">
          {visits
            .filter((v) => {
              if (!filterDate) return true;
              return (
                new Date(v.createdAt).toISOString().slice(0, 10) === filterDate
              );
            })
            .map((v) => (
              <div className="visit-card" key={v._id}>
                <img
                  src={`https://zugo-backend-trph.onrender.com/uploads/visits/${v.photo}`}
                  alt="visit"
                />
                <div className="visit-info">
                  <p><b>Client:</b> {v.clientName}</p>
                  <p><b>Phone:</b> {v.clientPhone}</p>
                  <p className="date">
                    {new Date(v.createdAt).toLocaleString()}
                  </p>

                  {isAdmin && (
                    <button
                      className="delete-visit-btn"
                      onClick={() => deleteVisit(v._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeActivity;
