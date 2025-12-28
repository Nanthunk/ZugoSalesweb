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


      if (res.data?.success) {
        const adminUser = {
          _id: res.data.admin?._id || "admin",
          name: "Admin",
          email,
          role: "admin",
        };

        localStorage.clear();
        localStorage.setItem("user", JSON.stringify(adminUser));

        navigate("/dashboard", { replace: true });
      } else {
        setError("Admin login failed");
      }
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


      if (res.data?.success && res.data?.employee) {
        const employee = {
          ...res.data.employee,
          role: "employee",
        };

        localStorage.clear();
        localStorage.setItem("user", JSON.stringify(employee));

        navigate("/dashboard", { replace: true });
      } else {
        setError("Employee login failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Employee login failed");
    }
  };

  /* =========================
        SUBMIT
  ========================= */
  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (mode === "admin") handleAdminLogin();
    else handleEmployeeLogin();
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
