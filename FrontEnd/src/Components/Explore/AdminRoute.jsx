import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import LoginModal from "../Login/LoginModal.jsx";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && !modalOpen) {
      setModalOpen(true);
    }
  }, [loading, user, modalOpen]);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  // ❌ Not logged in → ask to login
  if (!user) {
    return (
      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    );
  }

  // ❌ Logged in but NOT ADMIN
  if (!user.isAdmin) {
    return (
      <div className="text-red-500 text-center text-xl mt-20">
        ❌ You are not authorized to access this page.
      </div>
    );
  }

  // ✅ Logged in & admin
  return children;
};

export default AdminRoute;





