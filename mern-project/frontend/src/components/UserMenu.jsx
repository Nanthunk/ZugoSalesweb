import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserMenu.css";

const UserMenu = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [hasImage, setHasImage] = useState(false);

  /* =========================
     LOAD USER FROM STORAGE
  ========================= */
  useEffect(() => {
    let storedUser = null;

    try {
      storedUser = JSON.parse(localStorage.getItem("user"));
    } catch (err) {
      console.error("Invalid user in localStorage");
      storedUser = null;
    }

    if (storedUser) {
      setUser(storedUser);
      setHasImage(!!storedUser?.image);
    }

    /* =========================
       REFRESH USER FROM BACKEND
       (USING /me ROUTE)
    ========================= */
    const refreshUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res?.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          setHasImage(!!res.data.user?.image);
        }
      } catch (err) {
        console.error("User refresh failed:", err);
      }
    };

    refreshUser();
  }, []);

  /* =========================
     NAVIGATION
  ========================= */
  const goToLogin = () => {
    setOpen(false);
    navigate("/login");
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setHasImage(false);
    setOpen(false);
    navigate("/login");
  };

  /* =========================
     AVATAR LETTER
  ========================= */
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
            {hasImage && user?.image ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${user.image}`}
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
