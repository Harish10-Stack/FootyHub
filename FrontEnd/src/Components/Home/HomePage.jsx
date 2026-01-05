import React from "react";
import { useAuth } from "../Explore/AuthContext.jsx";
import MainPage from "./MainPage.jsx";
import AdminLayout from "../Admin/AdminLayout.jsx";
import AdminDashboard from "../Admin/AdminDashboard.jsx";

const HomePage = () => {
  const { user } = useAuth();

  return <MainPage />;
};

export default HomePage;
