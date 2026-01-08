import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "visits", // Cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploadVisitImage = multer({ storage });

export default uploadVisitImage;
