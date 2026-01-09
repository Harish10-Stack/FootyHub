
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";



// Context Providers
import { AuthProvider, useAuth } from "./Components/Explore/AuthContext.jsx";
import { CartProvider } from "./Components/Cart and Checkout/CartContext.jsx";
import { WishlistProvider } from "./Components/Explore/WishListContext.jsx";
import { NotificationProvider } from "./Components/Notifications/NotificationProvider.jsx";

// Public pages
import MainPage from "./Components/Home/MainPage.jsx";
import ShopPage from "./Components/Shop/ShopPage.jsx";
import ProductDetails from "./Components/Products/ProductDetails.jsx";
import LiveFixtures from "./Components/Fixtures and News/LiveFixtures.jsx";
import NewsFeed from "./Components/Fixtures and News/NewsFeed.jsx";
import ForgotPassword from "./Components/Passwords/ForgotPassword.jsx";
import ResetPassword from "./Components/Passwords/ResetPassword.jsx";
import PaymentSuccess from "./Components/Payment/PaymentSuccess.jsx";
import PaymentCancel from "./Components/Payment/PaymentCancel.jsx";
import ThankYou from "./Components/Cart and Checkout/ThankYou.jsx";
import NotificationsPage from "./Components/Notifications/Notifications.jsx";

// Protected pages
import ProtectedRoute from "./Components/Explore/ProtectedRoute.jsx";
import Profile from "./Components/Profile/Profile.jsx";
import Cart from "./Components/Cart and Checkout/Cart.jsx";
import CheckOutPage from "./Components/Cart and Checkout/CheckOutPage.jsx";
import OrdersPage from "./Components/Orders/OrdersPage.jsx";
import WishlistPage from "./Components/Shop/WishListPage.jsx";
import FootyHubExplore from "./Components/Explore/FootyHubExplore.jsx";

// Admin
import AdminRoute from "./Components/Explore/AdminRoute.jsx";
import AdminLayout from "./Components/Admin/AdminLayout.jsx";
import AdminMainPage from "./Components/Admin/AdminMainPage.jsx";
import AdminDashBoard from "./Components/Admin/AdminDashBoard.jsx";
import AdminProducts from "./Components/Admin/AdminProducts.jsx";
import AdminAddProduct from "./Components/Admin/AdminAddProduct.jsx";
import AdminEditProduct from "./Components/Admin/AdminEditProduct.jsx";
import AdminOrders from "./Components/Admin/AdminOrders.jsx";
import AdminUsers from "./Components/Admin/AdminUsers.jsx";
import AdminPoll from "./Components/Admin/AdminPoll.jsx";
import AdminFixtures from "./Components/Admin/AdminFixtures.jsx";
import AdminNews from "./Components/Admin/AdminNews.jsx";
import SendNotification from "./Components/Notifications/SendNotification.jsx";

function HomePage() {
  return <MainPage />;
}

function App() {
  return (
    <Router>
      <Toaster />

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

        {/* PROTECTED ROUTES */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckOutPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/footyhub/explore" element={<ProtectedRoute><FootyHubExplore /></ProtectedRoute>} />

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
