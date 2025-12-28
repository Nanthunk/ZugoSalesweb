import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserMenu from "../components/UserMenu";
import "../styles/ClientsFollow.css";

export default function ClientsFollow() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortDate, setSortDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/clients`)
      .then((res) => setClients(res.data))
      .catch((err) => console.log(err));
  }, []);

  // -------------------- FILTER LOGIC ---------------------
  const filtered = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // -------------------- SORTED + FILTERED COMBINATION ---------------------
  let dataToShow = filtered;

  if (sortDate) {
    dataToShow = filtered.filter((item) => item.date === sortDate);
  }

  // -------------------- DELETE CLIENT ---------------------
  const deleteClient = async (id) => {
    if (!id) {
      alert("Delete failed: missing id");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/clients/${id}`
      );

      if (res.status === 200 || res.status === 204) {
        setClients((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert("Delete failed, check server logs");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed. Check console.");
    }
  };

  const handleSortByDate = () => {
    if (!sortDate) {
      alert("Please select a date!");
      return;
    }
  };

  return (
    <div className="client-follow-container">
      <UserMenu />

      <div className="top-bar">
        <div>
          <h1 className="title">Clients Follow-up</h1>
          <h2 className="subtitle">Database</h2>
        </div>

        <div className="top-controls">
          <div className="sort-date-box">
            <button className="sort-btn" onClick={handleSortByDate}>
              Sort
            </button>

            <input
              type="date"
              className="date-box"
              value={sortDate}
              onChange={(e) => setSortDate(e.target.value)}
            />
          </div>

          <button
            className="add-client-btn"
            onClick={() => navigate("/add-client")}
          >
            Add New Client Visit
          </button>
        </div>
      </div>

      {/* Search Box */}
      <input
        className="search-box"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Status Buttons */}
      <div className="status-section">
        {["All", "Completed", "Processing", "On Hold", "Rejected"].map((st) => (
          <button
            key={st}
            className={`status-btn ${st.replace(" ", "")} ${
              st === statusFilter ? "active" : ""
            }`}
            onClick={() => setStatusFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <table className="clients-table">
        <thead>
          <tr>
            <th className="col-id">ID</th>
            <th className="col-name">Name</th>
            <th className="col-phone">Phone Number</th>
            <th className="col-date">Date</th>
            <th className="col-type">Business</th>
            <th className="col-follow">Following By</th>
            <th className="col-status">Status</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {dataToShow.length === 0 ? (
            <tr>
              <td colSpan={8} className="no-data">
                No clients found.
              </td>
            </tr>
          ) : (
            dataToShow.map((c, index) => (
              <tr key={index}>
                <td className="col-id">{c.customerId}</td>
                <td className="col-name">{c.name}</td>
                <td className="col-phone">{c.phone}</td>
                <td className="col-date">{c.date}</td>
                <td className="col-type">{c.type}</td>

                <td className="col-follow">
                  {c.followingBy ? c.followingBy : "—"}
                </td>

                <td className="col-status">
                  <span
                    className={`status ${c.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {c.status}
                  </span>
                </td>

                <td className="col-actions action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(`/add-client?id=${c._id}`, {
                        state: { client: c },
                      })
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteClient(c._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
