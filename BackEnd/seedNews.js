import mongoose from "mongoose";
import dotenv from "dotenv";
import News from "./models/News.js";

dotenv.config();

const newsData = [
  {
    title: "Manchester United win big!",
    description: "Manchester United defeated Liverpool 3-1 in a thrilling match.",
    date: "2025-11-01",
  },
  {
    title: "Champions League Final Date Confirmed",
    description: "The UEFA Champions League final will be held on June 1st.",
    date: "2025-11-02",
  },
  {
    title: "Cristiano Ronaldo Signs New Contract",
    description: "Ronaldo has renewed his contract with Al Nassr for another 2 years.",
    date: "2025-11-03",
  },
  {
    title: "Lionel Messi Scores Hat-trick",
    description: "Messi delivered an outstanding performance with a hat-trick against PSG.",
    date: "2025-11-04",
  },
  {
    title: "Premier League Top Scorer Race Heats Up",
    description: "The race for the Premier League Golden Boot is heating up with new contenders.",
    date: "2025-11-05",
  },
  {
    title: "Injury Update: Mohamed Salah",
    description: "Salah is expected to return after recovering from a minor ankle injury.",
    date: "2025-11-06",
  },
  {
    title: "La Liga Fixtures Announced",
    description: "The official schedule for the upcoming La Liga season has been released.",
    date: "2025-11-07",
  },
  {
    title: "Champions League Round of 16 Draw Complete",
    description: "The draw has been completed and exciting matchups await fans.",
    date: "2025-11-08",
  },
  {
    title: "World Cup Qualifiers Kick Off",
    description: "National teams start their campaign for the next FIFA World Cup.",
    date: "2025-11-09",
  },
];


mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected for news seeding");

    await News.deleteMany(); // remove old news
    await News.insertMany(newsData);

    console.log("🎉 News Imported Successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  });
