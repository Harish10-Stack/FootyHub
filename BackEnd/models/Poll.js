import mongoose from "mongoose";

const pollSchema = mongoose.Schema(
  {
    totalMessi: { type: Number, default: 0 },
    totalRonaldo: { type: Number, default: 0 },
    voters: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        player: { type: String, enum: ['messi', 'ronaldo'], required: true },
        votedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Poll = mongoose.models.Poll || mongoose.model("Poll", pollSchema);
export default Poll;
