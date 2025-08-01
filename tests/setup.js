import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

export async function connectDB() {
  console.log(mongoose.connection.readyState);
  if (mongoose.connection.readyState === 0) {
    await mongoose
      .connect(process.env.DB_TEST_URL)
      .then(() => console.log("DB connected"))
      .catch((err) => console.log(err));
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
