import Visit from "../models/visitModel.js";

export const getAdminVisits = async (req, res) => {
  try {
    const { date, employeeName } = req.query;

    // Validation
    if (!date || !employeeName) {
      return res.status(400).json({
        success: false,
        message: "Date and employee required",
      });
    }

    // Fetch visits
    const visits = await Visit.find({
      visitDate: date,
      employeeName: employeeName,
    })
      .sort({ createdAt: -1 })
      .select(
        "clientName phone feedback nextVisit image visitDate employeeName createdAt"
      );

    // No data case (optional but safe)
    if (!visits || visits.length === 0) {
      return res.status(200).json({
        success: true,
        visits: [],
        message: "No visits found for this date",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      visits,
    });
  } catch (err) {
    console.error("Get Admin Visits Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
