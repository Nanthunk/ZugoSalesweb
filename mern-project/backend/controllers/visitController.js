import Visit from "../models/visitModel.js";

export const getAdminVisits = async (req, res) => {
  try {
    const { date, employeeName } = req.query;

    if (!date || !employeeName) {
      return res.status(400).json({ message: "Date and employee required" });
    }

    const visits = await Visit.find({
      visitDate: date,
      employeeName: employeeName,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      visits,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
