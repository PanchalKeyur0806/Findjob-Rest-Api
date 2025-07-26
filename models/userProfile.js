import mongoose, { mongo } from "mongoose";

// education Schema
const educatoinSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  joiningDate: {
    type: Date,
    required: true,
  },
  endingDate: {
    type: Date,
    required: true,
  },
});

// user profile Schema
const userProfile = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  resumeFile: {
    type: String,
    required: true,
  },
  experience: [
    {
      companyName: { type: String },
      jobTitle: { type: String },
      address: { type: String },
      yearsOfExperience: { type: Number },
    },
  ],
  jobPrefrence: {
    type: String,
    enum: ["remote", "hybrid", "location", "full-time", "part-time"],
    default: "full-time",
  },
  education: [educatoinSchema],
  skills: [
    {
      type: String,
      required: true,
    },
  ],
});

const UserProfile = mongoose.model("UserProfile", userProfile);

export default UserProfile;
