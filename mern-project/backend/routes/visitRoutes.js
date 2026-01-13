import express from "express";
import Visit from "../models/visitModel.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* ======================
   SAVE VISIT (CLOUDINARY - BASE64)
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

    if (!imageBase64) {
      return res.status(400).json({ message: "Image missing" });
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
      photo: uploadRes.secure_url, // ✅ CLOUDINARY URL
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
====================== */
router.get("/employee/:name", async (req, res) => {
  try {
    const visits = await Visit.find({
      employeeName: req.params.name,
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

    const publicId = visit.photo.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`visits/${publicId}`);

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
   SAVE LIVE LOCATION (EMPLOYEE)
====================== */
router.post("/live-location", async (req, res) => {
  try {
    const { employeeName, lat, lng, accuracy } = req.body;

    if (!employeeName || !lat || !lng) {
      return res.status(400).json({ message: "Invalid location data" });
    }

    await Visit.create({
      employeeName,
      clientName: "LIVE_TRACK",
      clientPhone: "0000000000",
      lat,
      lng,
      photo: "",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Live location error:", err);
    res.status(500).json({ message: "Live location failed" });
  }
});

/* ======================
   GET LIVE LOCATIONS (ADMIN)
====================== */
router.get("/live-locations", async (req, res) => {
  try {
    const latest = await Visit.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$employeeName",
          lat: { $first: "$lat" },
          lng: { $first: "$lng" },
          time: { $first: "$createdAt" },
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
