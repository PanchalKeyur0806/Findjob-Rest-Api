import otpGenerator from "otp-generator";

function generateOtp() {
  if (process.env.NODE_ENV !== "production") {
    return "123456";
  }

  return otpGenerator.generate(6, {
    upperCaseAlphabets: true,
    specialChars: false,
  });
}

export { generateOtp };
