
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";

// Context Providers
import { AuthProvider, useAuth } from "./Components/Explore/AuthContext.jsx";
import { CartProvider } from "./Components/Cart and Checkout/CartContext.jsx";
import { WishlistProvider } from "./Components/Explore/WishListContext.jsx";
import { NotificationProvider } from "./Components/Notifications/NotificationProvider.jsx";

// Scroll to top utility
import ScrollToTop from "./utils/ScrollToTop.jsx";

// Lazy-loaded components
const MainPage = lazy(() => import("./Components/Home/MainPage.jsx"));
const ShopPage = lazy(() => import("./Components/Shop/ShopPage.jsx"));
const ProductDetails = lazy(() => import("./Components/Products/ProductDetails.jsx"));
const LiveFixtures = lazy(() => import("./Components/Fixtures and News/LiveFixtures.jsx"));
const NewsFeed = lazy(() => import("./Components/Fixtures and News/NewsFeed.jsx"));
const ForgotPassword = lazy(() => import("./Components/Passwords/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./Components/Passwords/ResetPassword.jsx"));
const PaymentSuccess = lazy(() => import("./Components/Payment/PaymentSuccess.jsx"));
const PaymentCancel = lazy(() => import("./Components/Payment/PaymentCancel.jsx"));
const ThankYou = lazy(() => import("./Components/Cart and Checkout/ThankYou.jsx"));
const NotificationsPage = lazy(() => import("./Components/Notifications/Notifications.jsx"));

// Protected pages
import ProtectedRoute from "./Components/Explore/ProtectedRoute.jsx";
const Profile = lazy(() => import("./Components/Profile/Profile.jsx"));
const Cart = lazy(() => import("./Components/Cart and Checkout/Cart.jsx"));
const CheckOutPage = lazy(() => import("./Components/Cart and Checkout/CheckOutPage.jsx"));
const OrdersPage = lazy(() => import("./Components/Orders/OrdersPage.jsx"));
const WishlistPage = lazy(() => import("./Components/Shop/WishListPage.jsx"));
const FootyHubExplore = lazy(() => import("./Components/Explore/FootyHubExplore.jsx"));

// Admin
import AdminRoute from "./Components/Explore/AdminRoute.jsx";
const AdminLayout = lazy(() => import("./Components/Admin/AdminLayout.jsx"));
const AdminMainPage = lazy(() => import("./Components/Admin/AdminMainPage.jsx"));
const AdminDashboard = lazy(() => import("./Components/Admin/AdminDashBoard.jsx"));
const AdminProducts = lazy(() => import("./Components/Admin/AdminProducts.jsx"));
const AdminAddProduct = lazy(() => import("./Components/Admin/AdminAddProduct.jsx"));
const AdminEditProduct = lazy(() => import("./Components/Admin/AdminEditProduct.jsx"));
const AdminOrders = lazy(() => import("./Components/Admin/AdminOrders.jsx"));
const AdminUsers = lazy(() => import("./Components/Admin/AdminUsers.jsx"));
const AdminPoll = lazy(() => import("./Components/Admin/AdminPoll.jsx"));
const AdminFixtures = lazy(() => import("./Components/Admin/AdminFixtures.jsx"));
const AdminNews = lazy(() => import("./Components/Admin/AdminNews.jsx"));
const SendNotification = lazy(() => import("./Components/Notifications/SendNotification.jsx"));

function HomePage() {
  return <MainPage />;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster />

      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div></div>}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/fixtures" element={<LiveFixtures />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/footyhub/explore" element={<FootyHubExplore />} />

          {/* PROTECTED ROUTES */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckOutPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminAddProduct />} />
            <Route path="products/edit/:id" element={<AdminEditProduct />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="poll" element={<AdminPoll />} />
            <Route path="fixtures" element={<AdminFixtures />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="notifications" element={<SendNotification />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

// ------------------------------------------------------
// APP WRAPPER WITHOUT SOCKET EVENT LISTENER
// ------------------------------------------------------
export default function AppWrapper() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
