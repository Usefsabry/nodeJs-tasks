import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT_NUMPER, () => {
    console.log(`Server is running on port ${process.env.PORT_NUMPER}`);
  });
  
} else {
  console.error("MONGODB_URI is not defined");
}
