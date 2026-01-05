import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import LoginModal from "../Login/LoginModal.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Show modal only if user is not logged in AFTER loading completes
  useEffect(() => {
    if (!loading && !user) {
      setModalOpen(true);
    }
  }, [loading, user]);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  // If not logged in → show LoginModal
  if (!user) {
    return (
      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        // ⬇️ IMPORTANT: ProtectedRoute does NOT call login() itself
        // LoginModal already calls login() internally and sets user in context
        onSuccess={() => {
          setModalOpen(false);
        }}
      />
    );
  }

  // Logged in → allow access
  return children;
};

export default ProtectedRoute;



