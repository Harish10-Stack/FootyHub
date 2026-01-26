import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Cart from "./cart.js";
import Wishlist from "./wishlist.js";
import Order from "./order.js";
import Notification from "./Notification.js";
import ReactionComment from "./ReactionComment.js";
import ProductReview from "./productReviewModel.js";
import SiteReview from "./siteReviewModel.js";
import Poll from "./Poll.js";
import News from "./News.js";
import Fixture from "./Fixture.js";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "/uploads/avatars/default-avatar.png" },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isAdmin: { type: Boolean, required: true, default: false },
    status: { type: String, enum: ["active", "blocked"], default: "active" },

    // Cart
    cart: [
      {
        _id: { type: String, required: true },
        name: String,
        price: Number,
        img: String,
        quantity: { type: Number, default: 1 },
        size: String,
      },
    ],

    // Fan poll vote tracking
    votedPlayer: { type: String, enum: ["messi", "ronaldo"], default: null },

    // ✅ Delivery address
    deliveryAddress: {
      fullName: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Password hashing
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre hook to delete related documents before deleting user
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    const userId = this._id;

    // Delete related documents
    await Promise.all([
      Cart.deleteMany({ user: userId }),
      Wishlist.deleteMany({ user: userId }),
      Order.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      ReactionComment.deleteMany({ userId: userId }),
      ProductReview.deleteMany({ user: userId }),
      SiteReview.deleteMany({ user: userId }),
      Poll.deleteMany({ user: userId }),
    ]);

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;














