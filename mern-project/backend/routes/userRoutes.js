import express from "express";
import { adminLogin, employeeLogin } from "../controllers/userController.js";
import { requireSignIn } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/admin-login", adminLogin);
router.post("/employee-login", employeeLogin);
router.get("/me", requireSignIn, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
