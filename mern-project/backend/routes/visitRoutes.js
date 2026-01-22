import express from "express";
import Visit from "../models/visitModel.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* ======================
   SAVE VISIT (ONLY CAMERA)
====================== */
router.post("/", async (req, res) => {
  try {
    const {
      employeeName,
      clientName,
      clientPhone,
      clientFeedback,
      nextVisit,
      lat,
      lng,
      imageBase64,
    } = req.body;

    // ✅ SINGLE FIX 🔥
    // Live-location calls will NOT save anything
    if (!imageBase64) {
      return res.status(200).json({
        success: true,
        skipped: true,
        message: "Live location ignored",
      });
    }

    // 🔥 Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(imageBase64, {
      folder: "visits",
    });

    const visit = new Visit({
      employeeName,
      clientName,
      clientPhone,
      clientFeedback: clientFeedback || "",
      nextVisit: nextVisit || "",
      lat: Number(lat),
      lng: Number(lng),
      photo: uploadRes.secure_url,
    });

    await visit.save();

    res.status(201).json({
      success: true,
      message: "Visit saved successfully",
      visit,
    });
  } catch (err) {
    console.error("Save visit error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   GET VISITS BY EMPLOYEE
   (ONLY CAMERA VISITS)
====================== */
router.get("/employee/:name", async (req, res) => {
  try {
    const visits = await Visit.find({
      employeeName: req.params.name,
      photo: { $ne: "" }, // ✅ EXTRA SAFETY
    }).sort({ createdAt: -1 });

    res.json(visits);
  } catch (err) {
    console.error("Get visits error:", err);
    res.status(500).json({ message: "Failed to load visits" });
  }
});

/* ======================
   DELETE VISIT (CLOUDINARY)
====================== */
router.delete("/:id", async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    if (visit.photo) {
      const publicId = visit.photo.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`visits/${publicId}`);
    }

    await Visit.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Visit deleted successfully",
    });
  } catch (err) {
    console.error("Delete visit error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});
// ===== TEMP IN-MEMORY LIVE LOCATION STORE =====
const liveUsers = {}; // { employeeName: { lat, lng, updatedAt } }

/* ======================
   LIVE LOCATION (STORE ONLY)
====================== */
router.post("/live-location", (req, res) => {
  const { employeeName, lat, lng } = req.body;

  if (!employeeName || !lat || !lng) {
    return res.status(400).json({ message: "Invalid live location" });
  }

  liveUsers[employeeName] = {
    lat,
    lng,
    updatedAt: Date.now(),
  };

  res.json({ success: true });
});

/* ======================
   ADMIN – GET LIVE LOCATIONS
====================== */
router.get("/live-locations", (req, res) => {
  const result = Object.entries(liveUsers).map(([name, loc]) => ({
    employeeName: name,
    lat: loc.lat,
    lng: loc.lng,
  }));

  res.json(result);
});


export default router;
