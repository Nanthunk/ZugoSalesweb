import React, { useState } from "react";
import "./AddMember.css";
import UserMenu from "../components/UserMenu";

const AddMember = () => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    image: "",
  });

  const userEmail = localStorage.getItem("userEmail"); // admin

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("/api/sales-members/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, addedBy: userEmail }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Member Added!");
        window.location.href = "/sales-members";
      });
  };

  return (
    <div className="add-container">
      <UserMenu />
      <h2>Add New Member</h2>

      <form onSubmit={handleSubmit} className="add-form">
        <input
          type="text"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Role"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Phone Number"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Image URL (optional)"
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <button type="submit">Add Member</button>
      </form>
    </div>
  );
};

export default AddMember;
