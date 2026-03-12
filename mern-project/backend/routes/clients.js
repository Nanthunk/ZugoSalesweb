import express from "express";
import Client from "../models/clientModel.js";

const router = express.Router();


// GET all clients (latest first)
router.get("/", async (req, res) => {
  try {

    const clients = await Client.find().sort({ createdAt: -1 });

    res.json(clients);

  } catch (err) {

    console.error("Fetch clients error:", err);
    res.status(500).json({ error: err.message });

  }
});


// GET single client
router.get("/:id", async (req, res) => {
  try {

    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);

  } catch (err) {

    console.error("Fetch client error:", err);
    res.status(500).json({ error: err.message });

  }
});


// ADD client
router.post("/", async (req, res) => {
  try {

    console.log("REQ BODY:", req.body);

    const newClient = new Client({

      customerId: req.body.customerId || "",

      name: req.body.name || "",
      phone: req.body.phone || "",
      email: req.body.email || "",

      date: req.body.date || "",
      visitDate: req.body.visitDate || "",

      location: req.body.location || "",

      type: req.body.type || "",

      status: req.body.status || "",

      followingBy: req.body.followingBy || "",

      bookedBy: req.body.bookedBy || ""

    });

    const savedClient = await newClient.save();

    res.status(201).json({
      success: true,
      message: "Client added successfully",
      data: savedClient
    });

  } catch (err) {

    console.error("Add client error:", err);
    res.status(500).json({ message: "Error adding client" });

  }
});


// UPDATE client
router.put("/:id", async (req, res) => {
  try {

    console.log("UPDATE BODY:", req.body);

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        customerId: req.body.customerId,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,

        date: req.body.date,
        visitDate: req.body.visitDate || "",

        location: req.body.location || "",

        type: req.body.type,

        status: req.body.status,

        followingBy: req.body.followingBy,

        bookedBy: req.body.bookedBy || ""
      },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({
      success: true,
      message: "Client updated successfully",
      data: updatedClient
    });

  } catch (err) {

    console.error("Update client error:", err);
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

    res.json({
      success: true,
      message: "Client deleted successfully"
    });

  } catch (err) {

    console.error("Delete client error:", err);
    res.status(500).json({ error: err.message });

  }
});

export default router;