import Visit from "../models/visitModel.js";
import cloudinary from "../config/cloudinary.js";

export const createVisit = async (req, res) => {
  try {
    const {
      employeeName,
      clientName,
      clientPhone,
      clientFeedback,
      nextVisit,
      lat,
      lng,
      imageBase64, // 👈 frontend sends this
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
      clientFeedback,
      nextVisit,
      lat,
      lng,
      photo: uploadRes.secure_url, // ✅ CLOUDINARY URL
    });

    await visit.save();

    res.status(201).json({ success: true, visit });
  } catch (err) {
    console.error("Create visit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
