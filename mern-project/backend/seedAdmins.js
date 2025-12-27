import mongoose from "mongoose";
import Admin from "./models/Admin.js";

const MONGO_URL = "mongodb://127.0.0.1:27017/yourdb";
mongoose.connect(MONGO_URL);

const seed = async () => {
  await Admin.create([
    { email: "zugoprivatelimited.md@gmail.com", password: "bharathraj13" },
    { email: "zugoprivatelimited.hr@gmail.com", password: "sindhu03" },
  ]);
  console.log("seeded admins");
  process.exit(0);
};

seed();
