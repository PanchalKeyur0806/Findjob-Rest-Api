import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
  // basic user info
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: Number,
  },
  dateOfBirth: {
    type: Date,
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  otp: {
    type: String,
  },
  otpVerifyTime: {
    type: Date,
    default: () => Date.now() + 60 * 1000,
  },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
});

// encrypt the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// compare password
userSchema.methods.comparePassword = function (
  candidatePassword,
  userPassword
) {
  const values = bcrypt.compare(candidatePassword, userPassword);
  return values;
};

const User = mongoose.model("User", userSchema);

export default User;
