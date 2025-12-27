import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    customerId: String,
    name: String,
    phone: String,
    email: String,
    date: String,
    type: String,
    followingBy: String,
    status: String
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
