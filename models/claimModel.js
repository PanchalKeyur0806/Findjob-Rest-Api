import mongoose from "mongoose";

const claimSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.ObjectId, ref: "Company", required: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamp: true,
  }
);

// fetch the appropriate fields
claimSchema.pre(/^find/, async function (next) {
  this.populate({
    path: "company",
    select: "companyName email phoneNumber address website description ",
  }).populate({
    path: "user",
    select: "name email phoneNumber dateOfBirth isVerifieds",
  });
  next();
});

const ClaimModel = mongoose.model("ClaimModel", claimSchema);
export { ClaimModel };
