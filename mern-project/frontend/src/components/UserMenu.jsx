import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserMenu.css";
import api from "../api/axios";



const UserMenu = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hasImage, setHasImage] = useState(false);

  // 🔥 LOAD USER + REFRESH FROM BACKEND
  useEffect(() => {
    const role = localStorage.getItem("role");

    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user"));
    } catch (err) {
      console.error("Invalid user in localStorage");
      storedUser = null;
    }

    // 🟢 SET USER FROM STORAGE FIRST
    if (storedUser) {
      setUser(storedUser);
      setHasImage(!!storedUser?.photoUrl);
    }

    // 🔥 REFRESH EMPLOYEE DETAILS (NOT ADMIN)
    const refreshUser = async () => {
      if (!storedUser?.email) return;
      if (role === "admin") return;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/employee-login`,
          { email: storedUser.email }
        );

        if (res?.data?.success && res.data.employee) {
          const updatedUser = {
            ...res.data.employee,
            photoUrl: res.data.employee.photoUrl || "",
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          setHasImage(!!updatedUser.photoUrl);
        }
      } catch (err) {
        console.error("Failed to refresh user:", err);
      }
    };

    refreshUser();
  }, []);

  // 🔥 NAVIGATE TO LOGIN
  const goToLogin = () => {
    setOpen(false);
    navigate("/login");
  };

  // 🔥 LOGOUT
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setHasImage(false);
    setOpen(false);
    navigate("/login");
  };

  // 🔥 AVATAR LETTER LOGIC
  const avatarLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="user-menu-container">
      {!user ? (
        <button className="login-btn" onClick={goToLogin}>
          Login
        </button>
      ) : (
        <>
          <div
            className="user-circle"
            onClick={() => setOpen(!open)}
            title={user?.email || "Account"}
          >
            {hasImage && user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="avatar"
                className="user-avatar"
                onError={() => setHasImage(false)}
              />
            ) : (
              <span className="user-initial">{avatarLetter}</span>
            )}
          </div>

          {open && (
            <div className="user-dropdown">
              <p onClick={goToLogin}>➕ Add another account</p>
              <p onClick={logout}>🚪 Logout</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserMenu;
