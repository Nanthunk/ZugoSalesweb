import mongoose from "mongoose";

const salesMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  image: { type: String, default: "" },   // optional profile image
  addedBy: { type: String, required: true }, // admin email who added the member
}, { timestamps: true });

export default mongoose.model("SalesMember", salesMemberSchema);
