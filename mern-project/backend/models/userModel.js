import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    password: { type: String, default: "" }, // added password field
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    photoUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
