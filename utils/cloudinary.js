import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import AppError from "./AppError.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (localfile) => {
  try {
    if (!localfile) return next(new AppError("localpath not found"));
    const respose = await cloudinary.uploader.upload(localfile);

    return respose;
  } catch (error) {
    console.log(error);
  }
};
