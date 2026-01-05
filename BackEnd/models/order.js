// backend/models/order.js
import mongoose from "mongoose";

const deliveryAddressSchema = mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const orderItemSchema = mongoose.Schema(
  {
    name: String,
    qty: Number,
    image: String,
    price: Number,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { _id: false }
);

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    deliveryAddress: deliveryAddressSchema, // <-- added
    paymentMethod: { type: String, default: "Stripe" },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    status: { type: String, default: "pending" },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;





