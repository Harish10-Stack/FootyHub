import React from "react";
import { useNavigate } from "react-router-dom";

const FootyHubExplore = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gray-900 text-white py-16 px-6 md:px-16 min-h-screen">
      {/* 🔙 Subtle Back to Home Link */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 text-green-300 font-medium no-underline hover:underline hover:text-green-200 transition-all duration-200 cursor-pointer z-50"
      >
        ⬅ Back to Home
      </button>

      <div className="max-w-6xl mx-auto text-center space-y-6 mt-10">
        <h2 className="text-4xl font-bold text-green-500 mb-4">FootyHub</h2>
        <p className="text-lg">
          FootyHub is a comprehensive football fan platform built using the MERN stack (MongoDB, Express, React, Node.js).  
          It brings together everything a football enthusiast could need — all in one modern, responsive web app.
        </p>

        <h3 className="text-2xl font-semibold text-green-400 mt-4">Key Features:</h3>
        <ul className="text-lg text-left max-w-3xl mx-auto list-disc list-inside space-y-2">
          <li>⚽ Live Match Updates: Follow your favorite teams and matches in real time.</li>
          <li>🗓️ Fixtures & Results: Stay updated with upcoming games and past match scores from top leagues including Premier League, La Liga, Serie A, Bundesliga, and MLS.</li>
          <li>📰 Latest Football News: Get real-time news, transfer updates, and match highlights.</li>
          <li>🛍️ FootyHub Shop: Browse and purchase football merchandise with a dynamic cart system and smooth checkout experience.</li>
          <li>🔍 Smart Search & Filters: Quickly find teams, players, or leagues with instant search results and league-based filtering.</li>
          <li>👤 User Login & Authentication: Personalized experience for fans with a secure login system.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-green-400 mt-4">Technology Highlights:</h3>
        <ul className="text-lg text-left max-w-3xl mx-auto list-disc list-inside space-y-2">
          <li>Built with React for a dynamic frontend experience.</li>
          <li>Node.js + Express powers a robust backend API.</li>
          <li>MongoDB manages user and product data efficiently.</li>
          <li>SportMonks API integration delivers live football data directly to users.</li>
          <li>Fully responsive design ensures seamless use on desktop, tablet, and mobile.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-green-400 mt-4">Why FootyHub?</h3>
        <p className="text-lg max-w-3xl mx-auto">
          FootyHub isn’t just a website — it’s a one-stop hub for football fans. Whether you want to check live scores, track your favorite teams, read breaking news, or shop for merch, everything is just a click away.  
          It combines real-time sports updates with a modern e-commerce experience, designed to be intuitive and engaging.
        </p>

        <p className="text-lg max-w-3xl mx-auto">
          Explore Now to experience the ultimate football companion — made for fans, by a fan. ⚡
        </p>

        <p className="text-lg font-semibold mt-4">
          Developed by Harish K.  
          <a
            href="https://portfolio-harish-two.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 hover:underline ml-1 transition-colors duration-200"
          >
            Visit my portfolio
          </a>
        </p>
      </div>
    </section>
  );
};

export default FootyHubExplore;





