import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import { useWishlist } from "../Explore/WishListContext.jsx";
import toast from "react-hot-toast";
import Navbar from "../Headers/ShopHeader.jsx";
import Footer from "../Home/Footer.jsx";
import {
  Heart,
  Search,
  Filter,
  ShoppingCart,
  Minus,
  Plus,
  Trophy,
  Star,
  Zap,
  Award,
} from "lucide-react";

const ShopPage = () => {
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [animatingHeart, setAnimatingHeart] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const API_BASE_URL = "https://footyhub-backend-hrqm.onrender.com/api";

  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  // Add to cart
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

  // Zoom handlers
  const openZoom = (product) => {
    setZoomedImage(product);
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const closeZoom = () => {
    setZoomedImage(null);
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleMouseMove = (e) => {
    if (zoomLevel > 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    }
  };

  // Filter & group products
  const filteredProducts = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        </div>
      </>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-gray-900 relative overflow-hidden">
      {!zoomedImage && <Navbar />}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white py-14 sm:py-20 mt-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div
            className="absolute top-32 right-16 w-16 h-16 bg-white/5 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/8 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-300 animate-bounce" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
            Premium Football Gear
          </h1>
          <p className="text-base sm:text-lg md:text-2xl opacity-95 max-w-4xl mx-auto leading-relaxed font-light px-2">
            Discover top-quality jerseys, boots, gloves, balls, and training
            equipment. Elevate your game with professional-grade football gear
            crafted for champions.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Star className="w-6 h-6 text-yellow-300 animate-pulse" />
            <Zap
              className="w-6 h-6 text-blue-300 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            <Award
              className="w-6 h-6 text-purple-300 animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-12 border border-white/20 relative overflow-hidden">
          {/* Floating background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full opacity-20 animate-pulse"></div>
          <div
            className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-blue-200 to-purple-300 rounded-full opacity-15 animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-stretch md:items-center justify-center relative z-10">
            {/* Search Input */}
            <div className="relative w-full md:flex-1 md:max-w-lg group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:border-green-300/50 transition-all duration-300 overflow-hidden">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-green-500 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search premium football gear..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 sm:py-5 bg-transparent focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500 font-medium text-base sm:text-lg"
                />
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:border-emerald-300/50 transition-all duration-300 overflow-hidden">
                <Filter className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-hover:text-emerald-500 transition-colors duration-300" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="pl-14 pr-10 py-4 sm:py-5 bg-transparent focus:outline-none focus:ring-0 text-gray-900 font-medium text-base sm:text-lg cursor-pointer appearance-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Football">⚽ Football</option>
                  <option value="Jerseys">👕 Jerseys</option>
                  <option value="Boots">🥾 Boots</option>
                  <option value="Goalkeeper Gloves">
                    🧤 Goalkeeper Gloves
                  </option>
                  <option value="Protective Gear">🛡️ Protective Gear</option>
                  <option value="Training Equipment">
                    🏋️ Training Equipment
                  </option>
                </select>
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {Object.keys(groupedProducts).length > 0 ? (
          Object.keys(groupedProducts).map((cat) => (
            <div key={cat} className="mb-20">
              {/* Category Header */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 mb-12 border border-white/30 relative overflow-hidden shadow-xl">
                {/* Floating background elements */}
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full opacity-30 animate-pulse"></div>
                <div
                  className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tr from-blue-200 to-purple-300 rounded-full opacity-20 animate-bounce"
                  style={{ animationDelay: "0.7s" }}
                ></div>
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-yellow-200 to-orange-300 rounded-full opacity-25 animate-pulse"
                  style={{ animationDelay: "1.2s" }}
                ></div>

                <div className="relative z-10 text-center">
                  <h2 className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text mb-2">
                    {cat}
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
                </div>
              </div>

              {/* Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {groupedProducts[cat].map((product) => {
                  const price =
                    typeof product.price === "number"
                      ? product.price
                      : parseFloat(
                          String(product.price).replace(/[₹,]/g, ""),
                        ) || 0;

                  const inWishlist = isInWishlist(product._id);

                  return (
                    <div
                      key={product._id}
                      className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/30 overflow-hidden group w-full flex flex-col relative hover:bg-white/90"
                    >
                      {/* Floating background elements */}
                      <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse"></div>
                      <div
                        className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-blue-200 to-purple-300 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-bounce"
                        style={{ animationDelay: "0.5s" }}
                      ></div>

                      {/* Product Image */}
                      <div className="relative overflow-hidden rounded-t-3xl">
                        <img
                          src={`${API_BASE_URL}${product.img}`}
                          alt={product.name}
                          className="w-full h-56 sm:h-64 md:h-80 object-cover group-hover:scale-110 transition-all duration-700 rounded-t-3xl"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                        {/* Quick view overlay */}
                        <button
                          onClick={() => openZoom(product)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
                        >
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-all duration-300">
                            <Search className="w-8 h-8 text-gray-800" />
                          </div>
                        </button>

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
                            className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-green-600 transition-colors duration-300 line-clamp-2 min-h-[3rem] group-hover:text-green-700"
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-4">
                            <p className="text-xl sm:text-2xl md:text-3xl font-black text-green-600 group-hover:text-green-700 transition-colors duration-300">
                              ₹{price.toLocaleString()}
                            </p>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{(price * 1.2).toLocaleString()}
                            </span>
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
                              className="w-full flex items-center justify-center gap-3 px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:via-green-700 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden group/btn"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                              <ShoppingCart
                                size={20}
                                className="relative z-10"
                              />
                              <span className="relative z-10">Add to Cart</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="text-8xl animate-bounce">🔍</div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-full animate-pulse"></div>
              <div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/30 max-w-md mx-auto">
              <h3 className="text-3xl font-bold text-gray-700 mb-4">
                No Products Found
              </h3>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                We couldn't find any products matching your search. Try
                adjusting your filters or explore our full collection!
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Full Image View */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Back Button */}
          <button
            onClick={closeZoom}
            className="absolute top-6 left-6 z-10 flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-gray-700 font-medium">Back to Shop</span>
          </button>

          {/* Full Image */}
          <img
            src={`${API_BASE_URL}${zoomedImage.img}`}
            alt={zoomedImage.name}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />

          {/* Product Name Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-3">
            <h3 className="text-white text-xl font-bold text-center">{zoomedImage.name}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
