import mongoose from "mongoose";
import httpServer from "./app.js";

// connect to db
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log("Error occured ", error));

httpServer.listen(process.env.PORT, () =>
  console.log("server is running on port ", process.env.PORT)
);
