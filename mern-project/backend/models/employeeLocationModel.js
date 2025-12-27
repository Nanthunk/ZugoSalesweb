import mongoose from "mongoose";

const employeeLocationSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  lat: Number,
  lng: Number,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model(
  "EmployeeLocation",
  employeeLocationSchema
);
