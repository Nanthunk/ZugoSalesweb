import express from "express";
import Client from "../models/clientModel.js";

const router = express.Router();

// GET all
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by ID
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD client (POST)
router.post("/add", async (req, res) => {
  try {
    const newClient = new Client({
      customerId: req.body.customerId,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      date: req.body.date,
      type: req.body.type,
      status: req.body.status,
      followingBy: req.body.followingBy
    });

    await newClient.save();
    res.json({ message: "Client added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding client" });
  }
});

// UPDATE client (PUT)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
