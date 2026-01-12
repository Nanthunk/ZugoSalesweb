import express from "express";
import Visit from "../models/visitModel.js";
import uploadVisitImage from "../middleware/uploadVisitImage.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/* ======================
   SAVE VISIT (CLOUDINARY)
====================== */
router.post(
  "/",
  uploadVisitImage.single("photo"), // frontend field = photo
  async (req, res) => {
    try {
      console.log("REQ BODY:", req.body);
      console.log("REQ FILE:", req.file);

      if (!req.file || !req.file.path) {
        return res.status(400).json({ message: "Image missing" });
      }

      const visit = new Visit({
        employeeName: req.body.employeeName,
        clientName: req.body.clientName,
        clientPhone: req.body.clientPhone,

        /* ===== NEW VALUES ===== */
        clientFeedback: req.body.clientFeedback || "",
        nextVisit: req.body.nextVisit || "",

        /* ✅ FORCE NUMBER (IMPORTANT FOR MAP) */
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),

        /* ✅ CLOUDINARY IMAGE URL */
        photo: req.file.path,
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
  }
);

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


router.post(
  "/",
  uploadVisitImage.single("photo"),
  async (req, res) => {

    console.log("FILE:", req.file); // 👈 ADD THIS

    if (!req.file) {
      return res.status(400).json({ message: "Image missing" });
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

    /* 🔥 Extract Cloudinary public_id safely */
    const urlParts = visit.photo.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.split(".")[0];

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



export default router;
