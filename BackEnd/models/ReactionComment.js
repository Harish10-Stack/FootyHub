import mongoose from "mongoose";

const reactionCommentSchema = mongoose.Schema({
  fixtureId: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  text: { type: String },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    fire: { type: Number, default: 0 },
  },
}, { timestamps: true });

const ReactionComment = mongoose.model("ReactionComment", reactionCommentSchema);

export default ReactionComment;


