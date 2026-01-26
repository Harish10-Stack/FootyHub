import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../Explore/AuthContext.jsx";
import api from "../../utils/api.js"; // ✅ use axios instance

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCartItems([]);
        return;
      }

      try {
        const { data } = await api.get("/cart"); // ✅ replaced fetch with axios
        setCartItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch cart:", err.response?.data?.message || err.message);
        setCartItems([]);
      }
    };

    fetchCart();
  }, [user]);

  // Add to cart
  const addToCart = async ({ productId, quantity = 1, size = "" }) => {
    if (!user) throw new Error("Not authenticated");

    try {
      const { data } = await api.post("/cart/add", { productId, quantity, size }); // ✅ axios
      setCartItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to add to cart:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity, size = "") => {
    if (!user) throw new Error("Not authenticated");

    try {
      const { data } = await api.put(`/cart/update/${productId}`, { quantity, size }); // ✅ axios
      setCartItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to update cart:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Remove item
  const removeFromCart = async (productId, size = "") => {
    if (!user) throw new Error("Not authenticated");

    try {
      const { data } = await api.delete(`/cart/remove/${productId}`, { data: { size } }); // ✅ axios with body
      setCartItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to remove item:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) throw new Error("Not authenticated");

    try {
      const { data } = await api.delete("/cart/clear"); // ✅ axios
      setCartItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to clear cart:", err.response?.data?.message || err.message);
      throw err;
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = typeof item.product?.price === "number"
      ? item.product.price
      : parseFloat(String(item.product?.price || "0").replace(/[₹,]/g, "")) || 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
















