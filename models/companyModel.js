import mongoose from "mongoose";

const companySchema = mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true, unique: true },
    address: { type: String, trim: true, required: true },
    description: { type: String, required: true, trim: true },
    companyLogo: { type: String, required: true, trim: true },
    website: [{ type: String, trim: true }],
    companyVerification: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    isClaimed: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamp: true,
  }
);

// only fetch active companies
companySchema.pre(/^find/, async function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Company = mongoose.model("Company", companySchema);
export default Company;
