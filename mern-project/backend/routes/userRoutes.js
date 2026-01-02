import express from "express";
import {
  adminLogin,
  employeeLogin,
  getMe,
} from "../controllers/userController.js";
import { requireSignIn } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin-login", adminLogin);
router.post("/employee-login", employeeLogin);

// 🔥 FIXED PROFILE ROUTE
router.get("/me", requireSignIn, getMe);

export default router;
