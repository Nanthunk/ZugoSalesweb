import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [mode, setMode] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* =========================
        ADMIN LOGIN
  ========================= */
  const handleAdminLogin = async () => {
    if (!email || !password) {
      setError("Admin email & password required");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/admin-login`,
        { email, password }
      );

      // ✅ FIX: save token + user
      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...res.data.admin, role: "admin" })
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Invalid admin credentials");
    }
  };

  /* =========================
        EMPLOYEE LOGIN
  ========================= */
  const handleEmployeeLogin = async () => {
    if (!email) {
      setError("Employee email required");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/employee-login`,
        { email }
      );

      // ✅ FIX: save token + user
      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...res.data.employee, role: "employee" })
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Employee login failed");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    mode === "admin" ? handleAdminLogin() : handleEmployeeLogin();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p>Sign in to continue</p>

        <div className="mode-switch">
          <button
            type="button"
            className={mode === "admin" ? "active" : ""}
            onClick={() => setMode("admin")}
          >
            Admin Login
          </button>

          <button
            type="button"
            className={mode === "employee" ? "active" : ""}
            onClick={() => setMode("employee")}
          >
            Employee Login
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode === "admin" && (
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
