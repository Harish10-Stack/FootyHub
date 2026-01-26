import { loadStripe } from "@stripe/stripe-js";
import api from "../../utils/api"; // use the api instance you already configured with backend URL

const stripePromise = loadStripe("pk_test_***********************"); // PUBLISHABLE KEY

export default function PaymentButton({ cart, user }) {
  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      // Use your preconfigured api instead of axios + process.env
      const { data } = await api.post("/api/payment/create-checkout-session", {
        cartItems: cart,
        userId: user._id,
      });

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Stripe error:", err);
      alert("Payment failed.");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded w-full"
    >
      Pay with Stripe
    </button>
  );
}

