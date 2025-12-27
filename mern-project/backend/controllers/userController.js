// backend/controllers/userController.js
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import SalesMember from "../models/SalesMember.js";

/* =========================
   ADMIN STATIC ACCOUNTS
========================= */
const admins = [
  { email: "zugoprivatelimited.md@gmail.com", password: "bharathraj13" },
  { email: "zugoprivatelimited.hr@gmail.com", password: "sindhu03" },
];

/* =========================
   ADMIN LOGIN
========================= */
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = admins.find(
    (a) => a.email === email && a.password === password
  );

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials",
    });
  }

  return res.json({
    success: true,
    role: "admin",
    user: {
      email,
      name: "Admin",
    },
  });
};

/* =========================
   EMPLOYEE LOGIN
========================= */
/* =========================
   EMPLOYEE LOGIN (UPDATED)
========================= */
export const employeeLogin = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email required",
    });
  }

  try {
    const salesMember = await SalesMember.findOne({ email });

    if (!salesMember) {
      return res.status(403).json({
        success: false,
        message: "This email is not registered. Contact Admin.",
      });
    }

    return res.json({
      success: true,
      role: "employee",
      employee: {
        _id: salesMember._id,
        name: salesMember.name,
        email: salesMember.email,
        role: salesMember.role,
      },
    });
  } catch (err) {
    console.error("Employee login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
