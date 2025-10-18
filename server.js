import mongoose from "mongoose";
import httpServer from "./app.js";

// connect to db
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log("Error occured ", error));

httpServer.listen(process.env.PORT, "0.0.0.0", () =>
  console.log("server is running on http://`0.0.0.0`:" + process.env.PORT)
);
