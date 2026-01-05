import mongoose from "mongoose";
import dotenv from "dotenv";
import Fixture from "./models/Fixture.js";
import fixturesData from "./data/fixturesData.js"

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected for fixtures seeding");

    await Fixture.deleteMany(); // clear old fixtures
    await Fixture.insertMany(fixturesData);

    console.log("🎉 Fixtures Imported Successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  });
