import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// EXISTING ROUTES
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
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));



/* =======================
   EXISTING ROUTES
======================= */
app.use("/api/users", userRoutes);
app.use("/api/members", salesMemberRoutes);
app.use("/clients", clientRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/visits", visitRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


/* =======================
   🔥 EMPLOYEE TRACKING
======================= */

// Schema


// Save location + photo


/* =======================
   DATABASE + SERVER
======================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
