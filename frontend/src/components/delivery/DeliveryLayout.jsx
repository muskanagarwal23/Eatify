// DeliveryLayout.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DeliverySidebar from "./DeliverySidebar";
import { 
  FaBell, 
  FaEnvelope, 
  FaQuestionCircle, 
  FaUser,
  FaMotorcycle,
  FaTruck,
  FaWallet,
  FaClock
} from "react-icons/fa";

const DeliveryLayout = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(2);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Check if user is delivery partner
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (user?.role !== "DELIVERY") {
      navigate("/");
    }
  }, [user, token, navigate]);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="flex">
        {/* Sidebar */}
        <DeliverySidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          
          {/* Top Navbar for Delivery Partner */}
          

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 py-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
              <p>© 2024 Eatify. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-red-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-red-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-red-500 transition-colors">Contact Support</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLayout;