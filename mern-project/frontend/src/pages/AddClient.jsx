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
    visitDate: "",
    location: "",
    type: "",
    status: "",
    followingBy: "",
    bookedBy: "",
  });

  const [members, setMembers] = useState([]);

  // Load members (sales persons)
  useEffect(() => {
    axios
      .get(`${API}/api/members`, auth)
      .then((res) => setMembers(res.data))
      .catch(() => console.log("Error loading members"));
  }, []);

  // AUTO CUSTOMER ID GENERATOR
  useEffect(() => {
    if (editId) return;

    axios
      .get(`${API}/api/clients`, auth)
      .then((res) => {
        const count = res.data.length + 1;

        const newId = "CL" + String(count).padStart(3, "0");

        setForm((prev) => ({
          ...prev,
          customerId: newId,
        }));
      })
      .catch(() => console.log("Customer ID generation failed"));
  }, [editId]);

  // Load client from state
  useEffect(() => {
    if (stateClient) {
      setForm(stateClient);
      setEditId(stateClient._id);
    }
  }, [stateClient]);

  // Load client from URL
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
        await axios.post(`${API}/api/clients`, form, auth);
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
                readOnly
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
              <label>Appointment Fixed Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Visiting Date</label>
              <input
                type="date"
                name="visitDate"
                value={form.visitDate}
                onChange={handleChange}
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
              <label>Client Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter client location"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option>DNP</option>
                <option>Follow-up</option>
                <option>Not-Interested</option>
                <option>Closed</option>
                <option>Demo-Booked</option>
              </select>
            </div>
          </div>

          {/* Row 5 */}
          <div className="form-row">
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

            <div className="form-group">
              <label>Booked By</label>
              <select
                name="bookedBy"
                value={form.bookedBy}
                onChange={handleChange}
                required
              >
                <option value="">Select Sales Person</option>
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