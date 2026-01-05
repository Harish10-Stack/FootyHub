import mongoose from "mongoose";
import dotenv from "dotenv";
import products from "./data/productData.js";
import Product from "./models/Product.js";
import SiteReview from "./models/siteReviewModel.js";
import User from "./models/User.js";
import Fixture from "./models/Fixture.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected for seeding");

    // Clear old products
    await Product.deleteMany();

    // Insert new products
    await Product.insertMany(products);
    console.log("🎉 Products Imported Successfully!");

    // Seed sample site reviews
    // Fetch some users to associate reviews with
    const users = await User.find({}).limit(3);
    if (users.length === 0) {
      console.warn("⚠️ No users found - Site reviews not seeded.");
      process.exit();
    }

    // Clear old site reviews
    await SiteReview.deleteMany();

    // Create sample site reviews array linked to users
    const siteReviews = [
      {
        user: users[0]._id,
        rating: 5,
        comment: "Excellent site with great features!",
      },
      {
        user: users[1]._id,
        rating: 4,
        comment: "Very user-friendly and responsive.",
      },
      {
        user: users[2]._id,
        rating: 3,
        comment: "Good site, but could use some improvements.",
      },
    ];

    // Insert sample site reviews
    await SiteReview.insertMany(siteReviews);
    console.log("🎉 Sample Site Reviews Seeded Successfully!");

    process.exit();
  })
  .catch((err) => {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  });
