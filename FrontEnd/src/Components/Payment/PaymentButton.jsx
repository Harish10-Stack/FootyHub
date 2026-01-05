import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe("pk_test_***********************"); // PUBLISHABLE KEY

export default function PaymentButton({ cart, user }) {
  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/payment/create-checkout-session`,
        {
          cartItems: cart,
          userId: user._id,
        },
        { withCredentials: true }
      );

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
