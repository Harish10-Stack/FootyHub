import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import axios from "axios";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist whenever user changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]); // clear wishlist when logged out
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/wishlist", {
          withCredentials: true,
        });
        setWishlist(res.data || []);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // Add product to wishlist
  const addToWishlist = async (productId) => {
    if (!user) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/wishlist",
        { productId },
        { withCredentials: true }
      );
      setWishlist(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
        withCredentials: true,
      });
      setWishlist(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Check if a product is in wishlist
  const isInWishlist = (productId) => wishlist.some(p => p.product && p.product._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};





