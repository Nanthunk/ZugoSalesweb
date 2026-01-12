import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// ROUTES
import userRoutes from "./routes/userRoutes.js";
import salesMemberRoutes from "./routes/salesMember.js";
import clientRoutes from "./routes/clients.js";
import activityRoutes from "./routes/activityRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";

dotenv.config();

const app = express();

/* =======================
   MIDDLEWARE
======================= */

// ✅ CORRECT CORS (VERY IMPORTANT)
app.use(
  cors({
    origin: "https://zugo-salesweb.vercel.app",
    credentials: true
  })
);

// ❌ REMOVE ALL MANUAL HEADER SETTING (DONE)


/* =======================
   ROUTES
======================= */

app.use("/api/users", userRoutes);
app.use("/api/members", salesMemberRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/visits", visitRoutes);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


/* =======================
   SERVER + DB
======================= */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
