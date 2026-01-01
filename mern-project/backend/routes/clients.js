import express from "express";
import Client from "../models/clientModel.js";

const router = express.Router();

// GET all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().sort({ date: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET client by ID
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD client ✅ FIXED
router.post("/", async (req, res) => {
  try {
    const newClient = new Client({
      customerId: req.body.customerId,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      date: req.body.date,
      type: req.body.type,
      status: req.body.status,
      followingBy: req.body.followingBy,
    });

    await newClient.save();

    res.status(201).json({
      success: true,
      message: "Client added successfully",
      data: newClient,
    });
  } catch (err) {
    console.error("Add client error:", err);
    res.status(500).json({ message: "Error adding client" });
  }
});

// UPDATE client
router.put("/:id", async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({
      success: true,
      message: "Client updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE client
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ success: true, message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
