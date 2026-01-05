import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["welcome", "order", "status", "review", "system", "admin-talk"],
      default: "system"
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;

