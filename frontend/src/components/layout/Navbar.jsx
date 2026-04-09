import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaUtensils,
} from "react-icons/fa";
import {loginSuccess} from "../../features/auth/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, token } = useSelector((state) => state.auth);
  const isLoggedIn = !!token;
  const { items } = useSelector((state) => state.cart);
  const cartCount = items?.reduce((total, item) => total + item.quantity, 0);
  
  const handleLogout = () => {
    localStorage.removeItem("token");

    dispatch(loginSuccess({
      user:null,
      token:null,
    }));
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Section */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <FaUtensils className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="ml-2 text-xl md:text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Eatify
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-red-500 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="text-gray-700 hover:text-red-500 font-medium transition-colors"
            >
              Browse
            </Link>
          </div>

          {/* Desktop Auth/Cart Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Cart Button */}
                <button
                  onClick={() => navigate("/cart")}
                  className="relative p-2 text-gray-700 hover:text-red-500 transition-colors"
                >
                  <FaShoppingCart className="w-5 h-5" />

                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-white" />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user?.role?.toLowerCase() || "customer"}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-5 py-2 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-50 font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-5 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:shadow-lg transition-all font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaBars className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                to="/browse"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Browse
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <FaShoppingCart className="w-4 h-4" />
                    <span>Cart</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <FaUser className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <span>My Orders</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-4 pt-4">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 px-4 py-2 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-50 font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:shadow-lg transition-all font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
