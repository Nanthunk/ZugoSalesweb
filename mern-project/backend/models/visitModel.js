import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
    },

    clientName: {
      type: String,
      required: true,
    },

    clientPhone: {
      type: String,
      required: true,
    },

    /* ===== NEW FIELDS ===== */
    clientFeedback: {
      type: String,
      default: "",
    },

    nextVisit: {
      type: String,
      default: "",
    },

    /* ===== LOCATION ===== */
    lat: {
      type: Number,
      required: true,
    },

    lng: {
      type: Number,
      required: true,
    },

    /* ===== IMAGE ===== */
    photo: {
      type: String, // Cloudinary URL OR local filename
      // required: true,
    },

    /* ===== IMPORTANT FOR ADMIN FILTER ===== */
    visitDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Visit", visitSchema);
