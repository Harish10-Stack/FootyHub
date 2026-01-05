import mongoose from "mongoose";
import dotenv from "dotenv";
import Fixture from "./models/Fixture.js";
import News from "./models/News.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fixturesData = [
  { league: "Premier League", home: "Manchester United", away: "Liverpool", date: "2025-11-01", time: "19:00" },
  { league: "Premier League", home: "Chelsea", away: "Arsenal", date: "2025-11-02", time: "21:00" },
  { league: "La Liga", home: "Real Madrid", away: "Barcelona", date: "2025-11-03", time: "20:00" },
  { league: "La Liga", home: "Atletico Madrid", away: "Sevilla", date: "2025-11-04", time: "22:00" },
  { league: "Serie A", home: "Juventus", away: "Inter Milan", date: "2025-11-05", time: "18:30" },
  { league: "Bundesliga", home: "Bayern Munich", away: "Borussia Dortmund", date: "2025-11-06", time: "20:30" },
  { league: "Ligue 1", home: "PSG", away: "Marseille", date: "2025-11-07", time: "21:00" },
  { league: "Champions League", home: "Liverpool", away: "Real Madrid", date: "2025-11-08", time: "21:00" },
  { league: "Club World Cup", home: "Al Hilal", away: "Palmeiras", date: "2025-11-09", time: "19:00" },
  { league: "FIFA World Cup", home: "Brazil", away: "Argentina", date: "2025-11-10", time: "20:00" },
  { league: "Indian Super League", home: "Kerala Blasters", away: "Mumbai City FC", date: "2025-11-11", time: "18:00" },
];

const newsData = [
  { title: "Manchester United Eye New Midfielder", description: "Rumors suggest Manchester United are interested in signing a top midfielder to bolster their squad for the Premier League and Champions League.", date: "2025-10-20" },
  { title: "Barcelona Target Young Striker", description: "Barcelona are reportedly scouting a young striker from La Liga to strengthen their attacking options.", date: "2025-10-19" },
  { title: "Juventus Looking to Sell Veteran Defender", description: "Juventus may offload one of their veteran defenders during the winter transfer window.", date: "2025-10-18" },
  { title: "Champions League: Major Upset Possible", description: "Analysts predict a major upset in the upcoming Champions League fixtures as underdogs prepare to challenge the top teams.", date: "2025-10-17" },
  { title: "Real Madrid Eyes Star Winger", description: "Real Madrid are considering a move for a top winger to boost their attack after mixed performances in La Liga.", date: "2025-10-16" },
  { title: "Bayern Munich Manager Under Pressure", description: "Bayern Munich's manager faces pressure after inconsistent results in the Bundesliga and Champions League.", date: "2025-10-15" },
];

const importData = async () => {
  try {
    await Fixture.deleteMany();
    await News.deleteMany();

    await Fixture.insertMany(fixturesData);
    await News.insertMany(newsData);

    console.log("Fixtures and News imported successfully!");
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
};

importData();
