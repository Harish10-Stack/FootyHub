import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Minus, Plus, Trophy, Star, Zap, Award } from "lucide-react";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import { useWishlist } from "../Explore/WishListContext.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Navbar from "../Headers/ShopHeader.jsx";
import Footer from "../Home/Footer.jsx";


const WishlistPage = () => {
  const { addToCart, updateQuantity, cartItems, totalItems } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [animatingHeart, setAnimatingHeart] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const res = await axios.get("https://footyhub-backend-cqir.onrender.com/api/wishlist", { withCredentials: true });
        setWishlist(res.data);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  // Quantity handlers
  const incrementQty = (productId) => {
    const newQty = (quantities[productId] || 1) + 1;
    setQuantities((prev) => ({ ...prev, [productId]: newQty }));
    const cartItem = cartItems.find((item) => item.product._id === productId);
    if (cartItem) updateQuantity(productId, newQty, cartItem.size || "");
  };

  const decrementQty = (productId) => {
    const newQty = Math.max((quantities[productId] || 1) - 1, 1);
    setQuantities((prev) => ({ ...prev, [productId]: newQty }));
    const cartItem = cartItems.find((item) => item.product._id === productId);
    if (cartItem) updateQuantity(productId, newQty, cartItem.size || "");
  };

  // Wishlist toggle with animation
  const toggleWishlist = async (product) => {
    if (!user)
      return toast.error("Login to manage wishlist", {
        position: "bottom-center",
      });

    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
      toast.success(`${product.name} removed from wishlist`, {
        position: "bottom-center",
      });
    } else {
      await addToWishlist(product._id);
      toast.success(`${product.name} added to wishlist`, {
        position: "bottom-center",
      });
    }

    setAnimatingHeart(product._id);
    setTimeout(() => setAnimatingHeart(null), 400);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add items to cart.", {
        position: "bottom-center",
      });
      return;
    }
    const quantity = quantities[product._id] || 1;
    try {
      await addToCart({ productId: product._id, quantity, size: "" });
      toast.success(`${product.name} added to cart!`, {
        position: "bottom-center",
      });
      setQuantities((prev) => ({ ...prev, [product._id]: 1 }));
    } catch (error) {
      toast.error("Failed to add to cart", { position: "bottom-center" });
    }
  };

  const handleUserClick = () => {
    Swal.fire({
      title: `Hello, ${user.name}!`,
      text: "Here is your wishlist.",
      icon: "info",
      confirmButtonColor: "#10B981",
      confirmButtonText: "OK",
    });
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading wishlist...</p>
          </div>
        </div>
      </>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-gray-900 relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white py-24 mt-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-16 w-16 h-16 bg-white/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/8 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-red-400 animate-bounce" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
            Your Wishlist
          </h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-4xl mx-auto leading-relaxed font-light">
            Keep track of your favorite football gear and never miss out on the latest deals. Your dream football collection awaits!
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Trophy className="w-6 h-6 text-yellow-300 animate-pulse" />
            <Star className="w-6 h-6 text-blue-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Award className="w-6 h-6 text-purple-300 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="text-4xl sm:text-6xl md:text-8xl animate-bounce">❤️</div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/30 max-w-md mx-auto">
              <h3 className="text-3xl font-bold text-gray-700 mb-4">
                Your Wishlist is Empty
              </h3>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Start adding your favorite products to keep them here for easy access. Discover amazing football gear!
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
              >
                Explore Shop
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map(({ product }) => {
              const price =
                typeof product.price === "number"
                  ? product.price
                  : parseFloat(
                      String(product.price).replace(/[₹,]/g, "")
                    ) || 0;

              const inWishlist = isInWishlist(product._id);

              return (
                <div
                  key={product._id}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/30 overflow-hidden group w-full flex flex-col relative hover:bg-white/90"
                >
                  {/* Floating background elements */}
                  <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-blue-200 to-purple-300 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-bounce" style={{ animationDelay: '0.5s' }}></div>

                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img
                      src={`https://footyhub-backend-cqir.onrender.com${product.img}`}
                      alt={product.name}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-all duration-700 rounded-t-3xl"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <svg
                          className="w-8 h-8 text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Wishlist Button - Floating */}
                    {user && !user.isAdmin && (
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                      >
                        <Heart
                          size={20}
                          className={`transition-all duration-300 ${
                            inWishlist
                              ? "text-red-500 fill-current"
                              : "text-gray-400 hover:text-red-400"
                          } ${
                            animatingHeart === product._id
                              ? "animate-pulse scale-125"
                              : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex flex-col flex-grow relative z-10">
                    <div className="flex-grow">
                      <h3
                        className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-green-600 transition-colors duration-300 line-clamp-2 min-h-[3.5rem] group-hover:text-green-700"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-3xl font-black text-green-600 group-hover:text-green-700 transition-colors duration-300">
                          ₹{price.toLocaleString()}
                        </p>
                        <span className="text-sm text-gray-500 line-through">₹{(price * 1.2).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {user && !user.isAdmin && (
                      <div className="space-y-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between bg-gray-50/80 rounded-2xl p-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => decrementQty(product._id)}
                              className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                              <Minus size={16} className="text-gray-600" />
                            </button>
                            <span className="text-lg font-bold text-gray-900 min-w-[2.5rem] text-center bg-white px-3 py-1 rounded-lg">
                              {quantities[product._id] || 1}
                            </span>
                            <button
                              onClick={() => incrementQty(product._id)}
                              className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                              <Plus size={16} className="text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:via-green-700 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden group/btn"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <ShoppingCart size={20} className="relative z-10" />
                          <span className="relative z-10">Add to Cart</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;










