import mongoose from "mongoose";

const jobSchema = mongoose.Schema(
  {
    // recruiter user id
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true },
    employeeType: {
      type: String,
      enum: ["fulltime", "parttime", "remote", "contract", "internship"],
      default: "fulltime",
    },
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    applicationDeadline: { type: Date, required: true },
    numberOfOpenings: { type: Number, required: true },
    jobCategory: { type: String, required: true },
    educationLevel: { type: String, required: true },
    responsibility: { type: String, trim: true, required: true },
    requirements: { type: String, trim: true, required: true },
    niceToHave: { type: String, trim: true, required: true },
    whatToExcept: { type: String, trim: true, required: true },
    skills: [{ type: String, trim: true, required: true }],
    yearsOfExp: { type: Number, required: true, min: 0, max: 10 },
    status: {
      type: String,
      enum: ["pending", "published", "closed"],
      default: "published",
    },
    viewsCount: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    applicationCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

jobSchema.pre(/^find/, async function (next) {
  this.find({ isActive: true });
  next();
});

const JobModel = mongoose.model("JobModel", jobSchema);
export default JobModel;
