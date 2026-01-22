import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Ensure your .env has:
// MONGO_URI=mongodb+srv://harishkaladharan10_db_user:<password>@cluster1.plim7mi.mongodb.net/footyhub?retryWrites=true&w=majority

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Failed:", err));

