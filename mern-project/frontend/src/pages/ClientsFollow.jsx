import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserMenu from "../components/UserMenu";
import "../styles/ClientsFollow.css";

const API = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export default function ClientsFollow() {

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortDate, setSortDate] = useState("");

  const navigate = useNavigate();

  // LOAD CLIENTS
  useEffect(() => {
    axios
  .get(`${API}/api/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then((res) => {
    console.log("CLIENT DATA:", res.data);   // 👈 add this
    setClients(res.data);
  })
  .catch((err) => console.log(err));
  }, []);

  // FILTER
  const filtered = clients.filter((c) => {

    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  let dataToShow = [...filtered].sort((a, b) =>
  b.customerId?.localeCompare(a.customerId)
);

  if (sortDate) {
    dataToShow = filtered.filter((item) => item.visitDate === sortDate);
  }

  // DELETE CLIENT
  const deleteClient = async (id) => {

    if (!window.confirm("Delete this client?")) return;

    try {

      await axios.delete(`${API}/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClients((prev) => prev.filter((c) => c._id !== id));

    } catch (err) {

      console.log(err);
      alert("Delete failed");

    }
  };

  const statusList = [
    "All",
    "DNP",
    "Follow-up",
    "Not-Interested",
    "Closed",
    "Demo-Booked",
  ];

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

            <button className="sort-btn">Sort</button>

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

      <input
        className="search-box"
        placeholder="Search by name or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* STATUS BUTTONS */}

      <div className="status-section">

        {statusList.map((st) => (

          <button
            key={st}
            className={`status-btn 
            ${st === statusFilter ? "active" : ""}
            ${st.replace(" ", "-").toLowerCase()}
            `}
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

            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Appointment</th>
            <th>Visit Date</th>
            <th>Location</th>
            <th>Business</th>
            <th>Booked By</th>
            <th>Following By</th>
            <th>Status</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {dataToShow.length === 0 ? (

            <tr>
              <td colSpan="11">No clients found.</td>
            </tr>

          ) : (

            dataToShow.map((c) => (

              <tr key={c._id}>

                <td>{c.customerId}</td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.date}</td>
                <td>{c.visitDate}</td>
                <td>{c.location}</td>
                <td>{c.type}</td>
                <td>{c.bookedBy}</td>
                <td>{c.followingBy}</td>

                <td className="col-status">

                  <span
                    className={`status-badge ${c.status
                      .replace(" ", "-")
                      .toLowerCase()}`}
                  >
                    {c.status}
                  </span>

                </td>

                <td>

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