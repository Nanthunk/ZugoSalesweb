import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },

    /* ===== NEW FIELDS ===== */
    clientFeedback: { type: String },
    nextVisit: { type: String },

    lat: Number,
    lng: Number,

    photo: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Visit", visitSchema);
