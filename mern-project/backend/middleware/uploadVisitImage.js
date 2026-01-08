import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "visits",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const uploadVisitImage = multer({ storage });

export default uploadVisitImage;
