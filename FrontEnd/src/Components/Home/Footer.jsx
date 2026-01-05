import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-6 md:pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">

          {/* Logo & Description */}
          <div className="md:col-span-2 lg:col-span-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-500 mb-3">FootyHub</h2>
            <p className="text-gray-400 text-sm md:text-base">
              All football news, live scores, standings, and transfers in one place.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm md:text-base">Explore</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#live" className="hover:text-green-500 transition text-sm md:text-base">Live</a></li>
              <li><a href="#fixtures" className="hover:text-green-500 transition text-sm md:text-base">Fixtures</a></li>
              <li><a href="#news" className="hover:text-green-500 transition text-sm md:text-base">News</a></li>
              <li><a href="#shop" className="hover:text-green-500 transition text-sm md:text-base">Shop</a></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm md:text-base">Follow Us</h3>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <a href="#" className="hover:text-green-500 transition text-sm md:text-base">Twitter</a>
              <a href="#" className="hover:text-green-500 transition text-sm md:text-base">Facebook</a>
              <a href="#" className="hover:text-green-500 transition text-sm md:text-base">Instagram</a>
            </div>
          </div>

          {/* Legal / Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm md:text-base">Stay Updated</h3>
            <p className="text-gray-400 mb-2 text-sm md:text-base">Subscribe to our newsletter:</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-3 py-2 rounded bg-gray-800 text-white focus:outline-none text-sm md:text-base"
              />
              <button className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition text-sm md:text-base">
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom section */}
        <div className="mt-8 md:mt-10 border-t border-gray-700 pt-4 md:pt-6 text-gray-400 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm">
          <span>© 2025 FootyHub. All rights reserved.</span>
          <div className="flex flex-wrap gap-3 md:gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-green-500 transition text-xs md:text-sm">Privacy Policy</a>
            <a href="#" className="hover:text-green-500 transition text-xs md:text-sm">Terms of Service</a>
            <a href="#" className="hover:text-green-500 transition text-xs md:text-sm">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;