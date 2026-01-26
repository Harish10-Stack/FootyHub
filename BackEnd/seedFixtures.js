import mongoose from "mongoose";
import dotenv from "dotenv";
import Fixture from "./models/Fixture.js"; // your Fixture model
import fixturesData from "./data/fixturesData.js"; // create a file with your fixture array

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected for fixture seeding");

    // Clear old fixtures
    await Fixture.deleteMany();

    // Insert new fixtures
    await Fixture.insertMany(fixturesData);
    console.log("🎉 Fixtures Imported Successfully!");

    process.exit();
  })
  .catch((err) => {
    console.error("❌ Fixture Seeding Failed:", err);
    process.exit(1);
  });

