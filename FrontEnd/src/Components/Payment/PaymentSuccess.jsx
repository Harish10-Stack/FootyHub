import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/api"; // ✅ use the preconfigured backend API

export default function PaymentSuccess() {
  const { id } = useParams(); // order ID from URL

  useEffect(() => {
    const markPaid = async () => {
      try {
        // Mark the order as paid using your backend
        await api.put(`/orders/${id}/pay`);

        Swal.fire({
          icon: "success",
          title: "Payment Successful 🎉",
          text: "Your order has been placed successfully!",
          confirmButtonColor: "#3085d6",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Payment succeeded but the order was not updated.",
        });
      }
    };

    markPaid();
  }, [id]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-3xl font-bold text-green-500">Processing Order...</h1>
      <p className="text-gray-400 mt-2">Please wait, redirecting...</p>

      <Link to="/orders" className="text-blue-400 underline mt-5 block">
        View Orders
      </Link>
    </div>
  );
}

