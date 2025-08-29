import mongoose from "mongoose";

const contactUsSchema = mongoose.Schema(
  {
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    message: { type: String, trim: true, required: true },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  },
  {
    timestamps: true,
  }
);

// only list pending contacts
contactUsSchema.pre(/^find/, async function (next) {
  this.find({ status: { $ne: "resolved" } });

  next();
});

export const ContactUs = mongoose.model("ContactUs", contactUsSchema);
