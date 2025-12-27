import express from "express";
import SalesMember from "../models/SalesMember.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import upload from "../middleware/upload.js";

const router = express.Router();

// ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);


// Get all sales members
router.get("/", async (req, res) => {
  try {
    const members = await SalesMember.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    console.error("Fetch members error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// GET single member by ID
router.get("/:id", async (req, res) => {
  try {
    const member = await SalesMember.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ADD MEMBER (admin only)
// ADD MEMBER (admin only)
router.post("/add", upload.single("image"), async (req, res) => {
  const admins = [
    { email: "zugoprivatelimited.md@gmail.com" },
    { email: "zugoprivatelimited.hr@gmail.com" }
  ];

  const { name, role, email, phone, addedBy } = req.body;
  const isAdmin = admins.find(a => a.email === addedBy);

  if (!isAdmin) {
    return res.status(401).json({ message: "Not Admin" });
  }

  try {
    // 🔥 PREVENT DUPLICATE EMAIL
    const exists = await SalesMember.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: "This email is already added as Sales Member"
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const member = new SalesMember({
      name,
      role,
      email,
      phone,
      image,
      addedBy
    });

    await member.save();
    res.status(201).json(member);

  } catch (err) {
    res.status(500).json({ message: "Error adding member" });
  }
});


// DELETE member
router.delete("/remove/:id", async (req, res) => {
  try {
    const deleted = await SalesMember.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove member" });
  }
});

// UPDATE MEMBER
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    let updateData = {
      name: req.body.name,
      role: req.body.role,
      email: req.body.email,
      phone: req.body.phone,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await SalesMember.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});


export default router;
