// src/pages/AddClient.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import UserMenu from "../components/UserMenu";
import "../styles/AddClient.css";

export default function AddClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Edit client (if editing)
  const stateClient = location.state?.client || null;
  const urlId = searchParams.get("id"); // ?id=xxxxx

  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState(stateClient?._id || urlId || null);

  // ---------- FORM STATE ----------
  const [form, setForm] = useState({
    customerId: "",
    name: "",
    phone: "",
    email: "",
    date: "",
    type: "",
    status: "",
    followingBy: ""   // NEW FIELD
  });

  const [members, setMembers] = useState([]);

// Load Sales Members
useEffect(() => {
  axios
    .get("http://localhost:5000/api/members/")
    .then((res) => setMembers(res.data))
    .catch(() => console.log("Error loading sales members"));
}, []);


  // If client was passed from navigation (instant load)
  useEffect(() => {
    if (stateClient) {
      setForm({
        customerId: stateClient.customerId || "",
        name: stateClient.name || "",
        phone: stateClient.phone || "",
        email: stateClient.email || "",
        date: stateClient.date || "",
        type: stateClient.type || "",
        status: stateClient.status || "",
        followingBy: stateClient.followingBy || ""   // NEW FIELD
      });
      setEditId(stateClient._id || editId);
      // Mark this client as viewed (so Dashboard can surface it)
      try {
        const key = "viewedClients";
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const filtered = arr.filter((it) => it.id !== (stateClient._id || ""));
        filtered.unshift({ id: stateClient._id, name: stateClient.name, viewedAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(filtered.slice(0, 50)));
      } catch (e) {
        console.error("Error marking viewed client:", e);
      }
    }
  }, [stateClient]);

  // If page was refreshed → fetch by ID
  useEffect(() => {
    async function fetchClient() {
      if (!urlId) return;
      setIsLoading(true);

      try {
        const res = await axios.get(`http://localhost:5000/clients/${urlId}`);
        const c = res.data;

        setForm({
          customerId: c.customerId || "",
          name: c.name || "",
          phone: c.phone || "",
          email: c.email || "",
          date: c.date || "",
          type: c.type || "",
          status: c.status || "",
          followingBy: c.followingBy || ""   // NEW FIELD
        });

        setEditId(c._id);
        // Mark viewed when loaded via URL (refresh or direct open)
        try {
          const key = "viewedClients";
          const raw = localStorage.getItem(key);
          const arr = raw ? JSON.parse(raw) : [];
          const filtered = arr.filter((it) => it.id !== (c._id || ""));
          filtered.unshift({ id: c._id, name: c.name, viewedAt: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(filtered.slice(0, 50)));
        } catch (e) {
          console.error("Error marking viewed client:", e);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        alert("Could not load client.");
      } finally {
        setIsLoading(false);
      }
    }

    if (!stateClient && urlId) fetchClient();
  }, [urlId, stateClient]);

  // ---------- INPUT CHANGE ----------
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ---------- FORM SUBMIT ----------
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/clients/${editId}`, form);
        alert("Client updated successfully");
      } else {
        await axios.post("http://localhost:5000/clients/add", form);
        alert("Client added successfully");
      }

      navigate("/clients-follow");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to save client");
    }
  }

  if (isLoading) return <div>Loading client...</div>;

  return (
    <div className="add-client-container">
      <UserMenu />

      <div className="form-card">
        <h1 className="form-title">{editId ? "Edit Client" : "Add New Client"}</h1>

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

            {/* NEW FIELD */}
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

          {/* Submit */}
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
