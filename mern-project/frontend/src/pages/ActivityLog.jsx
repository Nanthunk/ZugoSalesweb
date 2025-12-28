import React, { useEffect, useState } from "react";
import { isAdmin } from "../auth/isAdmin";
import "../styles/ActivityLog.css";
import UserMenu from "../components/UserMenu";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const ActivityLog = () => {
  const userEmail = localStorage.getItem("email");
  const admin = isAdmin(userEmail);

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState([]);

  const [newName, setNewName] = useState("");
  const [newClients, setNewClients] = useState("");
  const [members, setMembers] = useState([]);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // ⭐⭐ 12 Color Palette — One for Each Month ⭐⭐
  const monthColors = {
    1: "#ff9595ff",
    2: "#fade9cff",
    3: "#9ffe9fff",
    4: "#b0cffbff",
    5: "#d5adf9ff",
    6: "#ffb8eaff",
    7: "#95f7f7ff",
    8: "#f8d192ff",
    9: "#85b57fff",
    10: "#9cabd0ff",
    11: "#cc94d1ff",
    12: "#f8b59aff",
  };

  const getMonthColor = (month) => monthColors[month] || "#f2f2f2";

  // Fetch members
  useEffect(() => {
    api
      .get("/api/members")
      .then((res) => setMembers(res.data))
      .catch(() => console.log("Cannot load members"));
  }, []);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const res = await api.get("/api/activity");
      setActivities(res.data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Add Activity
  const addActivity = async (e) => {
    e.preventDefault();
    if (!newName || !newClients || !month || !year)
      return alert("Please fill all details");

    try {
      await api.post("/api/activity/add", {
        name: newName.trim(),
        clients: Number(newClients),
        month: Number(month),
        year: Number(year),
      });

      fetchActivities();

      setNewName("");
      setNewClients("");
      setMonth("");
      setYear("");
    } catch (err) {
      console.log("Add error:", err);
    }
  };

  // DELETE ACTIVITY
  const deleteActivity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await api.delete(`/api/activity/${id}`);

      if (res.data.success) {
        setActivities((prev) => prev.filter((a) => a._id !== id));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.log("Delete error:", err);
      alert("Something went wrong");
    }
  };

  // Filters
  let filtered = activities.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesMonth = filterMonth === "" || a.month == filterMonth;
    const matchesYear = filterYear === "" || a.year == filterYear;

    return matchesSearch && matchesMonth && matchesYear;
  });

  // Sort latest year/month first
  filtered.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <div className="activity-container">
      <UserMenu />
      <h2 className="title">Activity</h2>

      {/* Search Bar */}
      <div className="search-box">
        <span className="icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filter-section">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">Filter by Month</option>
          {[
            "January","February","March","April","May","June",
            "July","August","September","October","November","December",
          ].map((m, i) => (
            <option value={i + 1} key={i}>{m}</option>
          ))}
        </select>

        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">Filter by Year</option>
          {Array.from({ length: 20 }, (_, i) => 2020 + i).map((y) => (
            <option value={y} key={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Add Activity */}
      {admin && (
        <form className="add-form" onSubmit={addActivity}>
          <select value={newName} onChange={(e) => setNewName(e.target.value)}>
            <option value="">Select Employee</option>
            {members.map((m) => (
              <option key={m._id} value={m.name}>{m.name}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="No. of Clients Booked"
            value={newClients}
            onChange={(e) => setNewClients(e.target.value)}
          />

          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">Select Month</option>
            {[
              "January","February","March","April","May","June",
              "July","August","September","October","November","December",
            ].map((m, i) => (
              <option value={i + 1} key={i}>{m}</option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year</option>
            {Array.from({ length: 20 }, (_, i) => 2020 + i).map((y) => (
              <option value={y} key={y}>{y}</option>
            ))}
          </select>

          <button type="submit">Add</button>
        </form>
      )}

      {/* Display List */}
      <div className="list">
        {filtered.map((item) => (
          <div
            key={item._id}
            className="list-item"
            style={{
              backgroundColor: getMonthColor(item.month),
              borderRadius: "12px",
              padding: "12px",
            }}
          >
            <div
              className="left-info"
              onClick={() => navigate(`/employee-activity/${item.name}`)}
            >
              <span className="emp-name">
                {item.name} — {item.month}/{item.year}
              </span>

              <span className="count">
                Clients Booked: {item.clients}
              </span>
            </div>

            {admin && (
              <button
                className="delete-btn"
                onClick={() => deleteActivity(item._id)}
              >
                ✖
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
