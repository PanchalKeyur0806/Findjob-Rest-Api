import mongoose from "mongoose";

const applicationSchema = mongoose.Schema({
  userProfile: {
    type: mongoose.Schema.ObjectId,
    ref: "UserProfile",
    required: true,
  },
  job: { type: mongoose.Schema.ObjectId, ref: "JobModel", required: true },
  isRetrived: { type: Boolean, default: false },
});

applicationSchema.pre(/^find/, async function (next) {
  this.populate({ path: "userProfile", select: "-_id" }).populate({
    path: "job",
    select: "-_id",
  });
  next();
});

const Applications = mongoose.model("Applications", applicationSchema);

export default Applications;
