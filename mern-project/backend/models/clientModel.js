import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    customerId: String,
    name: String,
    phone: String,
    email: String,

    date: String,
    visitDate: String,

    location: String,

    type: String,
    status: String,

    followingBy: String,
    bookedBy: String
  },
  {
    timestamps: true,
    strict: false   // 🔥 IMPORTANT
  }
);

export default mongoose.model("Client", clientSchema);