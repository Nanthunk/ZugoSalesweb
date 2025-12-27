// SalesMembers.jsx
import React, { useState, useEffect } from "react";
import "../styles/SalesMembers.css";
import { isAdmin } from "../auth/isAdmin";
import UserMenu from "../components/UserMenu";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SalesMembers = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/members/")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error("Fetch members error:", err));
  }, []);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/members/remove/${id}`);
      alert("Member removed successfully!");
      setMembers(members.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="team-container">
      <UserMenu />

      <div className="team-header">
        <h2>Team Members</h2>
      </div>

      <div className="team-topbar">
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="team-search"
        />

        {isAdmin() && (
          <div
            className="add-member-box"
            onClick={() => navigate("/access-control")}
          >
            <p className="add-title">Add Members</p>
            <p className="add-sub">Go to Access Control</p>
          </div>
        )}
      </div>

      <div className="member-grid">
        {filtered.map((m) => (
          <div key={m._id} className="member-card">
            <img
              src={`http://localhost:5000${m.image}`}
              className="member-avatar"
            />

            <h3>{m.name}</h3>

            <p className="label">Role</p>
            <p>{m.role}</p>

            <p className="label">Email</p>
            <p>{m.email}</p>

            <p className="label">Phone</p>
            <p>{m.phone}</p>

            <button
              className="view-btn"
              onClick={() => navigate(`/employee-activity/${m.name}`)}
            >
              View Activity
            </button>

            {isAdmin() && (
              <>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/access-control?id=${m._id}`)}
                >
                  Edit
                </button>

                <button
                  className="view-btn"
                  onClick={() => handleRemove(m._id)}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesMembers;
