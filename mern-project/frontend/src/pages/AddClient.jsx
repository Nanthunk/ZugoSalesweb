import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import UserMenu from "../components/UserMenu";
import "../styles/AddClient.css";

const API = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const auth = {
  headers: { Authorization: `Bearer ${token}` },
};

export default function AddClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateClient = location.state?.client || null;
  const urlId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState(stateClient?._id || urlId || null);

  const [form, setForm] = useState({
    customerId: "",
    name: "",
    phone: "",
    email: "",
    date: "",
    type: "",
    status: "",
    followingBy: "",
  });

  const [members, setMembers] = useState([]);

  // Load members
  useEffect(() => {
    axios
      .get(`${API}/api/members`, auth)
      .then((res) => setMembers(res.data))
      .catch(() => console.log("Error loading members"));
  }, []);

  // Load from state
  useEffect(() => {
    if (stateClient) {
      setForm(stateClient);
      setEditId(stateClient._id);
    }
  }, [stateClient]);

  // Load by URL ID
  useEffect(() => {
    if (!urlId || stateClient) return;

    setIsLoading(true);
    axios
      .get(`${API}/api/clients/${urlId}`, auth)
      .then((res) => {
        setForm(res.data);
        setEditId(res.data._id);
      })
      .catch(() => alert("Failed to load client"))
      .finally(() => setIsLoading(false));
  }, [urlId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`${API}/api/clients/${editId}`, form, auth);
        alert("Client updated successfully");
      } else {
        await axios.post(`${API}/api/clients`, form, auth); // ✅ FIXED
        alert("Client added successfully");
      }

      navigate("/clients-follow");
    } catch (err) {
      console.error("Save client error:", err);
      alert("Failed to save client");
    }
  }

  if (isLoading) return <div>Loading client...</div>;

  return (
    <div className="add-client-container">
      <UserMenu />

      <div className="form-card">
        <h1 className="form-title">
          {editId ? "Edit Client" : "Add New Client"}
        </h1>

        <form className="client-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>Customer ID</label>
              <input
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Business Type</label>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option>Completed</option>
                <option>Processing</option>
                <option>On Hold</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label>Following By</label>
              <select
                name="followingBy"
                value={form.followingBy}
                onChange={handleChange}
                required
              >
                <option value="">Select Staff</option>
                {members.map((m) => (
                  <option key={m._id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="submit-row">
            <button type="submit" className="submit-btn">
              {editId ? "Save Changes" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
