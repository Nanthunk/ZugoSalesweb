// backend/controllers/userController.js
import User from "../models/userModel.js";
import SalesMember from "../models/SalesMember.js";
import jwt from "jsonwebtoken";

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

  // ✅ CREATE TOKEN
  const token = jwt.sign(
    { email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // ✅ SET COOKIE (VERY IMPORTANT)
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
  success: true,
  token,
  user: {
    email,
    name: "Admin",
    role: "admin",
  },
});

};

/* =========================
   EMPLOYEE LOGIN
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

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      {
        id: salesMember._id,
        email: salesMember.email,
        role: "employee",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SET COOKIE (VERY IMPORTANT)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
  success: true,
  token,
  user: {
    _id: salesMember._id,
    name: salesMember.name,
    email: salesMember.email,
    role: "employee",
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
