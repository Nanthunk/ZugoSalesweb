import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import UserMenu from "../components/UserMenu";
import "../styles/AddClient.css";

const API = import.meta.env.VITE_API_URL;

export default function AddClient() {

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const token = localStorage.getItem("token");

  const auth = {
    headers: { Authorization: `Bearer ${token}` },
  };

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

  // Load members
  useEffect(() => {
    axios
      .get(`${API}/api/members`, auth)
      .then((res) => setMembers(res.data))
      .catch(() => console.log("Error loading members"));
  }, []);

  // Auto Customer ID
  useEffect(() => {

    if (editId) return;

    axios
      .get(`${API}/api/clients`, auth)
      .then((res) => {

        const count = res.data.length + 1;
        const newId = "ZPL" + String(count).padStart(3, "0");

        setForm((prev) => ({
          ...prev,
          customerId: newId,
        }));

      })
      .catch(() => console.log("Customer ID generation failed"));

  }, [editId]);

  // Load client from state
  useEffect(() => {

    if (!stateClient) return;

    setForm({
      customerId: stateClient.customerId || "",
      name: stateClient.name || "",
      phone: stateClient.phone || "",
      email: stateClient.email || "",
      date: stateClient.date || "",
      visitDate: stateClient.visitDate || "",
      location: stateClient.location || "",
      type: stateClient.type || "",
      status: stateClient.status || "",
      followingBy: stateClient.followingBy || "",
      bookedBy: stateClient.bookedBy || "",
    });

    setEditId(stateClient._id);

  }, [stateClient]);

  // Load client from URL
  useEffect(() => {

    if (!urlId || stateClient) return;

    setIsLoading(true);

    axios
      .get(`${API}/api/clients/${urlId}`, auth)
      .then((res) => {

        const c = res.data;

        setForm({
          customerId: c.customerId || "",
          name: c.name || "",
          phone: c.phone || "",
          email: c.email || "",
          date: c.date || "",
          visitDate: c.visitDate || "",
          location: c.location || "",
          type: c.type || "",
          status: c.status || "",
          followingBy: c.followingBy || "",
          bookedBy: c.bookedBy || "",
        });

        setEditId(c._id);

      })
      .catch(() => alert("Failed to load client"))
      .finally(() => setIsLoading(false));

  }, [urlId]);

  function handleChange(e) {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  }

  async function handleSubmit(e) {

    e.preventDefault();

    const payload = {
      customerId: form.customerId || "",
      name: form.name || "",
      phone: form.phone || "",
      email: form.email || "",
      date: form.date || "",
      visitDate: form.visitDate || "",
      location: form.location || "",
      type: form.type || "",
      status: form.status || "",
      followingBy: form.followingBy || "",
      bookedBy: form.bookedBy || ""
    };

    console.log("SENDING DATA:", payload);

    try {

      if (editId) {

        await axios.put(`${API}/api/clients/${editId}`, payload, auth);
        alert("Client updated successfully");

      } else {

        await axios.post(`${API}/api/clients`, payload, auth);
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
              <input name="customerId" value={form.customerId} readOnly />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>

          </div>

          {/* Row 2 */}
          <div className="form-row">

            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} />
            </div>

          </div>

          {/* Row 3 */}
          <div className="form-row">

            <div className="form-group">
              <label>Appointment Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Visit Date</label>
              <input type="date" name="visitDate" value={form.visitDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Business Type</label>
              <input name="type" value={form.type} onChange={handleChange} required />
            </div>

          </div>

          {/* Row 4 */}
          <div className="form-row">

            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} required>
                <option value="">Select</option>
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
              <select name="followingBy" value={form.followingBy} onChange={handleChange} required>
                <option value="">Select</option>
                {members.map((m) => (
                  <option key={m._id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Booked By</label>
              <select name="bookedBy" value={form.bookedBy} onChange={handleChange}>
                <option value="">Select</option>
                {members.map((m) => (
                  <option key={m._id} value={m.name}>{m.name}</option>
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