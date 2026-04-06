// OrderTracking.jsx
import { useEffect, useState } from "react";
import { getSocket } from "../../sockets/socket";
import { getMyOrders, cancelOrder } from "../../features/orders/orderAPI";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaUtensils,
  FaMotorcycle,
  FaHome,
  FaShoppingBag,
  FaCreditCard,
  FaCheck,
  FaHourglassHalf,
} from "react-icons/fa";

const OrderTracking = () => {
  const [timeline, setTimeline] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = localStorage.getItem("orderId");

    if (!orderId) {
      navigate("/orders");
      return;
    }

    const socket = getSocket();

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await getMyOrders();
        const foundOrder = data.find((o) => o._id === orderId);

        if (foundOrder) {
          console.log("📦 Initial fetch:", foundOrder);
          setOrder(foundOrder);
          setTimeline(foundOrder.timeline || []);
        }
      } catch (err) {
        console.log(err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial order
    fetchOrder();

    // Socket connection for real-time updates
    if (socket) {
      console.log("✅ Socket connected for tracking");
      socket.emit("joinOrder", orderId);

      socket.on("orderTimelineUpdate", (data) => {
        console.log("📡 Status update received:", data);
        setTimeline((prev) => [...prev, data]);

        setOrder((prev) => ({
          ...prev,
          status: data.status,
        }));
      });

      return () => {
        socket.off("orderTimelineUpdate");
      };
    }
  }, [navigate]);

  const handleCancel = async () => {
    try {
      if (!window.confirm("Are you sure you want to cancel this order?"))
        return;

      await cancelOrder(order._id);

      toast.success("Order cancelled");

      // update UI instantly
      setOrder((prev) => ({
        ...prev,
        status: "CANCELLED",
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PLACED":
        return <FaShoppingBag className="text-yellow-500" />;
      case "PAID":
        return <FaCreditCard className="text-green-500" />;
      case "ACCEPTED":
        return <FaCheck className="text-blue-500" />;
      case "PREPARING":
        return <FaUtensils className="text-orange-500" />;
      case "DELIVERY_ASSIGNED":
        return <FaMotorcycle className="text-purple-500" />;
      case "PICKED_UP":
        return <FaMotorcycle className="text-indigo-500" />;
      case "DELIVERED":
        return <FaHome className="text-green-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "PLACED":
        return "Your order has been placed successfully";
      case "PAID":
        return "Payment confirmed";
      case "ACCEPTED":
        return "Restaurant has accepted your order";
      case "PREPARING":
        return "Your food is being prepared";
      case "DELIVERY_ASSIGNED":
        return "Delivery partner assigned";
      case "PICKED_UP":
        return "Food picked up and on the way";
      case "DELIVERED":
        return "Order delivered! Enjoy your meal";
      default:
        return "Order update received";
    }
  };

  const getEstimatedTime = (status) => {
    switch (status) {
      case "PLACED":
        return "Estimated: 25-35 minutes";
      case "PAID":
        return "Estimated: 20-30 minutes";
      case "ACCEPTED":
        return "Estimated: 15-25 minutes";
      case "PREPARING":
        return "Estimated: 10-20 minutes";
      case "DELIVERY_ASSIGNED":
        return "Estimated: 10-15 minutes";
      case "PICKED_UP":
        return "Estimated: 5-10 minutes";
      case "DELIVERED":
        return "Delivered!";
      default:
        return "Tracking your order";
    }
  };

  const currentStatus = timeline[timeline.length - 1]?.status;
  const progressPercentage = (() => {
    const statusOrder = [
      "PLACED",
      "PAID",
      "ACCEPTED",
      "PREPARING",
      "DELIVERY_ASSIGNED",
      "PICKED_UP",
      "DELIVERED",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statusOrder.length) * 100;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="space-y-3 mt-8">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Order Found
            </h2>
            <p className="text-gray-500 mb-6">
              We couldn't find any active order to track
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Track Order
          </h1>
          <p className="text-gray-500 mt-1">Real-time updates for your order</p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
            <div className="flex justify-between items-center text-white">
              <div>
                <p className="text-sm opacity-90">Order ID</p>
                <p className="font-mono font-bold">#{order._id?.slice(-8)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total Amount</p>
                <p className="font-bold text-xl">₹{order.totalAmount}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-500 text-sm">Order Status</p>
                <p className="text-xl font-bold text-gray-800 capitalize">
                  {currentStatus?.toLowerCase() || "Processing"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">Estimated Time</p>
                <p className="font-medium text-gray-800">
                  {getEstimatedTime(currentStatus)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Order Placed</span>
                <span>Preparing</span>
                <span>On the Way</span>
                <span>Delivered</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            {/* 🔥 CANCEL BUTTON */}
            {!["PICKED_UP", "DELIVERED", "CANCELLED"].includes(
              currentStatus,
            ) && (
              <button
                onClick={handleCancel}
                className="mt-4 w-full py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-all"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Order Timeline
          </h2>

          {timeline.length === 0 ? (
            <div className="text-center py-8">
              <FaHourglassHalf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Waiting for updates...</p>
              <p className="text-sm text-gray-400 mt-1">
                Your order is being processed
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {timeline.map((event, index) => {
                const isCompleted = true;
                const isLast = index === timeline.length - 1;

                return (
                  <div key={index} className="flex gap-4">
                    {/* Timeline Icon */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10
                        ${isCompleted ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gray-200"}`}
                      >
                        {getStatusIcon(event.status)}
                      </div>
                      {!isLast && (
                        <div className="absolute top-10 w-0.5 h-12 bg-gray-300"></div>
                      )}
                    </div>

                    {/* Timeline Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800 capitalize">
                          {event.status.toLowerCase()}
                        </p>
                        {event.timestamp && (
                          <span className="text-xs text-gray-400">
                            {new Date(event.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">
                        {event.message || getStatusMessage(event.status)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 p-4 bg-orange-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FaClock className="text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800">
                Need help with your order?
              </p>
              <p className="text-sm text-gray-600">
                Contact our support team at{" "}
                <span className="text-red-500">support@eatify.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Link
            to="/orders"
            className="flex-1 border-2 border-red-500 text-red-500 py-3 rounded-full font-semibold hover:bg-red-50 transition-colors text-center"
          >
            View All Orders
          </Link>
          <Link
            to="/browse"
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all text-center"
          >
            Order Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
