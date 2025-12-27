import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  clients: { type: Number, required: true },
  month: { type: String, default: "" }, // future use
  year: { type: Number, default: "" },  // future use
});

const Activity = mongoose.model("Activity", ActivitySchema);

export default Activity;
