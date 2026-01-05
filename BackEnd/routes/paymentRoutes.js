import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/order.js";

dotenv.config();

const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc Create Stripe checkout session
// @route POST /api/payment/create-checkout-session
// router.post("/create-checkout-session", async (req, res) => {
//   try {
//     const { cartItems, userId } = req.body;

//     if (!cartItems?.length) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // Convert cart into Stripe format
//     const lineItems = cartItems.map((item) => ({
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.name,
//         },
//         unit_amount: item.price * 100, // cents
//       },
//       quantity: item.quantity,
//     }));

//     // Create order in DB as unpaid
//     const order = await Order.create({
//       user: userId,
//       orderItems: cartItems,
//       totalPrice: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
//       isPaid: false,
//     });

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: lineItems,
//       success_url: `${process.env.FRONTEND_URL}/payment-success/${order._id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/checkout`,
//       metadata: { orderId: order._id.toString() },
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe Checkout Error:", error);
//     res.status(500).json({ message: "Stripe checkout failed" });
//   }
// });

export default router;
