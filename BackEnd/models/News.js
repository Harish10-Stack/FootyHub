import mongoose from "mongoose";

const reactionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const newsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reactions: [reactionSchema],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Explicitly tell Mongoose to use the "news" collection in Atlas
const News = mongoose.models.News || mongoose.model("News", newsSchema, "news");
export default News;

