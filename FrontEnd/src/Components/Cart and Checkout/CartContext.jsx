import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../Explore/AuthContext.jsx";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // no token required (cookies used)
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart from backend when user logs in or user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCartItems([]); // clear cart when logged out
        return;
      }

      try {
        const res = await fetch("https://footyhub-backend.onrender.com/api/cart", {
          method: "GET",
          credentials: "include", // send cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          setCartItems([]);
          return;
        }

        const data = await res.json();
        setCartItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setCartItems([]);
      }
    };

    fetchCart();
  }, [user]);

  // Add to cart
  const addToCart = async ({ productId, quantity = 1, size = "" }) => {
    if (!user) throw new Error("Not authenticated");

    try {
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, size }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add to cart");
      }

      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to add to cart:", err);
      throw err;
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity, size = "") => {
    if (!user) throw new Error("Not authenticated");

    try {
      const res = await fetch(`http://localhost:5000/api/cart/update/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, size }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update cart");
      }

      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to update cart:", err);
      throw err;
    }
  };

  // Remove item
  const removeFromCart = async (productId, size = "") => {
    if (!user) throw new Error("Not authenticated");

    try {
      const res = await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to remove item");
      }

      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to remove item:", err);
      throw err;
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) throw new Error("Not authenticated");

    try {
      const res = await fetch(`http://localhost:5000/api/cart/clear`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to clear cart");
      }

      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Failed to clear cart:", err);
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
















