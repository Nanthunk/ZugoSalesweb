// src/auth/isAdmin.js

export const isAdmin = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return false;

    const user = JSON.parse(storedUser);

    return user?.role === "admin";
  } catch (err) {
    console.error("Invalid user data in localStorage", err);
    localStorage.removeItem("user");
    return false;
  }
};
