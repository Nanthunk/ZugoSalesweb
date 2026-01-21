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

/* ======================
   LIVE LOCATION (NO DB SAVE ❌)
====================== */
router.post("/live-location", async (req, res) => {
  // ❌ DO NOT SAVE IN VISITS
  // frontend admin map already polling this separately
  return res.json({ success: true });
});

/* ======================
   GET LIVE LOCATIONS (ADMIN MAP)
====================== */
router.get("/live-locations", async (req, res) => {
  try {
    const latest = await Visit.aggregate([
      { $match: { photo: { $ne: "" } } }, // safety
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$employeeName", // ✅ Correctly groups by name
          lat: { $first: "$lat" },
          lng: { $first: "$lng" },
        },
      },
      {
        $project: {
          _id: 0,
          employeeName: "$_id", // ✅ Return proper field name instead of _id
          lat: 1,
          lng: 1,
        },
      },
    ]);

    res.json(latest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch live locations" });
  }
});

export default router;
