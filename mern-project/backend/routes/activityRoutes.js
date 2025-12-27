import express from "express";
import Activity from "../models/Activity.js";

const router = express.Router();

// GET ALL activities
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find().sort({ year: -1, month: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADD or UPDATE activity record
router.post("/add", async (req, res) => {
  try {
    const { name, clients, month, year } = req.body;

    let existing = await Activity.findOne({ name, month, year });

    if (existing) {
      existing.clients = clients;
      await existing.save();
      return res.json({ success: true, message: "Updated", data: existing });
    }

    const newActivity = await Activity.create({ name, clients, month, year });
    res.json({ success: true, message: "Created", data: newActivity });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET activity logs of one employee
router.get("/employee/:name", async (req, res) => {
  try {
    const logs = await Activity.find({ name: req.params.name }).sort({
      year: 1,
      month: 1
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE VISIT
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Visit.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    res.json({
      success: true,
      message: "Visit deleted successfully",
    });
  } catch (err) {
    console.error("Delete visit error:", err);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});


export default router;
