import otpGenerator from "otp-generator";

function generateOtp() {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: true,
    specialChars: false,
  });
}

export { generateOtp };
