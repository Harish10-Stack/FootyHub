import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const reactionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, enum: ["👍", "❤️", "😂", "😮", "😢", "👎"], required: true },
  },
  { _id: false }
);

const fixtureSchema = mongoose.Schema(
  {
    home: { type: String, required: true },
    away: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    league: { type: String, required: true },
    reactions: [reactionSchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Explicitly tell Mongoose to use the "fixtures" collection in Atlas
const Fixture = mongoose.models.Fixture || mongoose.model("Fixture", fixtureSchema, "fixtures");
export default Fixture;






