// src/Components/Shop/ProductGrid.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import toast, { Toaster } from "react-hot-toast";

const ProductGrid = ({ products, showAll = false, hideButton = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const displayedProducts = showAll ? products : products.slice(0, 3);
  console.log("API URL:", import.meta.env.VITE_API_URL);

  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-5 text-green-600">Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProducts.map((product) => {
          const price = typeof product.price === "number" ? product.price : parseFloat(String(product.price || "").replace(/[₹,]/g, "")) || 0;

          return (
            <div key={product._id} className="border rounded-xl overflow-hidden shadow hover:shadow-2xl transition transform hover:-translate-y-1">
              <div className="h-48 w-full overflow-hidden relative">
                <img src= src={`https://footyhub-backend-hrqm.onrender.com${product.img}`} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>

              <div className="p-4 flex flex-col gap-2" onClick={() => navigate(`/product/${product._id}`)} style={{cursor:'pointer'}}>
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <span className="text-gray-700 font-semibold">₹{price.toLocaleString()}</span>
                {user && !user.isAdmin && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user) {
                        toast.error("Please login to add items to cart.", {
                          duration: 3000,
                          position: 'top-right',
                        });
                        return;
                      }
                      try {
                        await addToCart({ productId: product._id, quantity: 1, size: "", product });
                        toast.success(`${product.name} added to cart!`, {
                          duration: 3000,
                          position: 'bottom-center',
                        });
                      } catch (error) {
                        toast.error('Failed to add to cart. Please try again.', {
                          duration: 3000,
                          position: 'top-right',
                        });
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && !hideButton && (
        <div className="mt-6 text-center">
          <button onClick={() => navigate("/shop")} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer">
            View More
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
