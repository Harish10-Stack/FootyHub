import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;














