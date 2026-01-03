import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Visit from "../models/visitModel.js";

const router = express.Router();

/* ======================
   ENSURE UPLOAD FOLDER
====================== */
const uploadDir = "uploads/visits";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ======================
   MULTER CONFIG
====================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ======================
   SAVE VISIT (CAMERA)
====================== */
router.post("/", upload.single("photo"), async (req, res) => {
  console.log("REQ BODY:", req.body);
  console.log("REQ FILE:", req.file);

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image missing" });
    }

    const visit = new Visit({
      employeeName: req.body.employeeName,
      clientName: req.body.clientName,
      clientPhone: req.body.clientPhone,

      /* ===== NEW SAVED VALUES ===== */
      clientFeedback: req.body.clientFeedback,
      nextVisit: req.body.nextVisit,

      lat: req.body.lat,
      lng: req.body.lng,
      photo: req.file.filename,
    });

    await visit.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: "Failed to load visits" });
  }
});

/* ======================
   DELETE VISIT
====================== */
router.delete("/:id", async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    const imagePath = path.join(uploadDir, visit.photo);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
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

export default router;
