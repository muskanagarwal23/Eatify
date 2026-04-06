// VendorSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaChartLine, 
  FaShoppingBag, 
  FaUtensils, 
  FaUser, 
  FaSignOutAlt,
  FaStore,
  FaTruck,
  FaStar,
  FaClipboardList,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaBars
} from "react-icons/fa";
import { useState } from "react";
import { loginSuccess } from "../../features/auth/authSlice";
import toast from "react-hot-toast";

const menuItems = [
  {
    name: "Dashboard",
    path: "/vendor/dashboard",
    icon: <FaChartLine />,
    description: "Overview & analytics"
  },
  {
    name: "Orders",
    path: "/vendor/orders",
    icon: <FaShoppingBag />,
    description: "Manage deliveries"
  },
  {
    name: "Menu",
    path: "/vendor/menu",
    icon: <FaUtensils />,
    description: "Manage food items"
  },
  {
    name: "Profile",
    path: "/vendor/profile",
    icon: <FaUser />,
    description: "Restaurant info"
  },
  {
    name: "Reviews",
    path: "/vendor/reviews",
    icon: <FaStar />,
    description: "Customer feedback"
  },
  {
    name: "Settings",
    path: "/vendor/settings",
    icon: <FaCog />,
    description: "Preferences"
  }
];

const VendorSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(loginSuccess({ user: null, token: null }));
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white p-2 rounded-lg shadow-lg"
      >
        <FaBars />
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-50 bg-white shadow-xl transition-all duration-300 flex flex-col
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "left-0" : "-left-64 lg:left-0"}
          ${!isMobileOpen && "lg:left-0"}
        `}
      >
        {/* Logo Section */}
        <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${isCollapsed ? "flex-col" : ""}`}>
          <div className="flex items-center gap-2">
            
            
          </div>
          
          {/* Collapse Button - Desktop only */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block text-gray-400 hover:text-red-500 transition-colors"
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Vendor Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <FaStore className="text-white text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {user?.name || "Restaurant Owner"}
                </p>
                <p className="text-xs text-gray-500 truncate">Vendor Account</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isCollapsed ? "justify-center" : ""}
                ${
                  isActive
                    ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-red-500"
                }`
              }
              title={isCollapsed ? item.name : ""}
            >
              <span className={`text-lg ${isCollapsed ? "" : ""}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {/* Quick Stats (when collapsed) */}
          {isCollapsed && (
            <div className="flex flex-col items-center gap-2 pb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FaTruck className="text-green-600 text-sm" />
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200
              ${isCollapsed ? "justify-center" : ""}
            `}
            title={isCollapsed ? "Logout" : ""}
          >
            <FaSignOutAlt className="text-lg" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>

          {/* Version Info */}
          {!isCollapsed && (
            <div className="text-center pt-4">
              <p className="text-xs text-gray-400">Version 2.0.0</p>
              <p className="text-xs text-gray-400">© 2024 Eatify</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VendorSidebar;