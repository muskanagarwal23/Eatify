// VendorLayout.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";
import { FaBell, FaEnvelope, FaQuestionCircle, FaUser } from "react-icons/fa";

const VendorLayout = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(3);

  // Check if user is vendor
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (user?.role !== "VENDOR") {
      navigate("/");
    }
  }, [user, token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 overflow-x-hidden">
      <div className="flex">
        {/* Sidebar */}
        <VendorSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          
          

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 py-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
              <p>© 2024 Eatify. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-red-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-red-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-red-500 transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default VendorLayout;