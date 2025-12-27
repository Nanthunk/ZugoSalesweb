// AccessControl.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AccessControl.css";
import UserMenu from "../components/UserMenu";
import { useSearchParams } from "react-router-dom";

const AccessControl = () => {
  const [admins, setAdmins] = useState([]);
  const [members, setMembers] = useState([]);

  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    image: null,
    existingImage: null,
  });

  // ✅ SAFE USER READ
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch {
    storedUser = null;
  }


  const allowedAdmins = [
  "zugoprivatelimited.md@gmail.com",
  "zugoprivatelimited.hr@gmail.com",
];

const isAdmin =
  storedUser?.role === "admin" &&
  allowedAdmins.includes(storedUser?.email);

  // ------- FETCH ADMINS + MEMBERS -------
  useEffect(() => {
    fetchAdmins();
    fetchMembers();
    if (editId) fetchEditingMember();
  }, [editId]);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/members/admins");
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/members");
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEditingMember = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/members/${editId}`
      );
      const m = res.data;

      setFormData({
        name: m.name || "",
        role: m.role || "",
        email: m.email || "",
        phone: m.phone || "",
        image: null,
        existingImage: m.image || null,
      });
    } catch (err) {
      console.error("Failed to load member", err);
    }
  };

  // ------- HANDLE INPUT -------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ------- ADD OR UPDATE -------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin || !storedUser) {
      alert("You are not authorized");
      return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("role", formData.role);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    form.append("addedBy", storedUser.email);

    if (formData.image) {
      form.append("image", formData.image);
    }

    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/members/update/${editId}`,
          form
        );
        alert("Member updated!");
      } else {
        await axios.post(
          "http://localhost:5000/api/members/add",
          form
        );
        alert("Member added!");
      }
    } catch (err) {
      alert("Error saving member");
    }
  };

  return (
    <div className="access-container">
      <UserMenu />

      <h2 className="page-title">
        {isEditing ? "Edit Sales Member" : "Access Control"}
      </h2>

      {!isAdmin && (
        <div className="not-admin-box">
          <p>You do not have permission to view this page.</p>
        </div>
      )}

      {isAdmin && (
        <div className="add-member-card">
          <h3>{isEditing ? "Edit Member" : "Add Sales Member"}</h3>

          <form className="add-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="image-section">
                <img
                  src={
                    formData.image
                      ? URL.createObjectURL(formData.image)
                      : formData.existingImage
                      ? `http://localhost:5000${formData.existingImage}`
                      : "/default-user.png"
                  }
                  className="preview-img"
                  alt="preview"
                />

                <input
                  id="profilePic"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files[0],
                    })
                  }
                />

                <button
                  type="button"
                  className="upload-btn"
                  onClick={() =>
                    document.getElementById("profilePic").click()
                  }
                >
                  Upload Photo
                </button>
              </div>

              <div className="fields-section">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                />
                <input
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Job Role"
                  required
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                />

                <button className="add-btn" type="submit">
                  {isEditing ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
