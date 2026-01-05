import React from "react";
import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="text-center py-20">
      <h1 className="text-red-500 text-4xl font-bold">Payment Cancelled ❌</h1>
      <p className="text-gray-300 mt-2">Your payment did NOT go through.</p>

      <Link to="/cart" className="mt-4 inline-block px-6 py-3 bg-red-600 rounded-lg text-white">
        Back to Cart
      </Link>
    </div>
  );
}
