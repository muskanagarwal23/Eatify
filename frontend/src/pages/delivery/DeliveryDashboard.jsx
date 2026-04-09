// DeliveryDashboard.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaMotorcycle,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaClock,
  FaRupeeSign,
  FaStar,
  FaCheckCircle,
  FaSpinner,
  FaEye,
  FaTruck,
  FaUser,
  FaPhone,
  FaUtensils,
  FaLocationArrow,
  FaCheck,
  FaTimesCircle,
  FaArrowRight,
  FaChartLine,
  FaCalendarAlt,
  FaBoxOpen,
  FaWallet,
  FaThumbsUp
} from "react-icons/fa";
import toast from "react-hot-toast";
import DeliveryLayout from "../../components/delivery/DeliveryLayout";
import { getAssignedOrders, updateStatus } from "../../features/delivery/deliveryAPI";
import { getSocket } from "../../sockets/socket";

const DeliveryDashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    averageRating:0,
    completedToday: 0,
    activeOrders: 0,
    todayEarnings:0,
    
  });

  useEffect(() => {
    // Check if user is delivery partner
    if (user?.role !== "DELIVERY") {
      navigate("/");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async (silent = false) => {
  try {
     if(silent) setLoading(true);

    const res = await getAssignedOrders();

    const ordersData = res.data.orders || res.data;

    if (!Array.isArray(ordersData)) {
      console.error("Orders is not an array:", ordersData);
      setOrders([]);
      return;
    }

    setOrders(ordersData);
    
    // REAL STATS
    const completed = ordersData.filter(
        o => o.status === "DELIVERED");
    const active = ordersData.filter(
        o => !["DELIVERED", "CANCELLED"].includes(o.status));

    const today = new Date().toDateString();

    const completedToday = completed.filter(
      o => new Date(o.updatedAt).toDateString() === today
    );

    const totalEarnings = completed.reduce(
      (sum, o) => sum + (o.deliveryFee || 0),
      0
    );

    const todayEarningsCalc = completedToday.reduce(
      (sum, o) => sum + (o.deliveryFee || 0),
      0
    );

    setStats({
      totalDeliveries: completed.length,
      totalEarnings,
      averageRating:0,
      completedToday: completedToday.length,
      activeOrders: active.length,
      
    });

    setTodayEarnings(todayEarningsCalc);

  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("Failed to load orders");
  } finally {
    setLoading(false);
  }
};

  const updateOrderStatus = async (orderId, newStatus) => {
    
    try {
        setUpdatingStatus(true);
        setUpdatingOrderId(orderId);

        await updateStatus(orderId, {status:newStatus});

        toast.success("Status updated successfully");

        
     
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  

useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const userId = user?._id;

  socket.emit("joinUserRoom", userId);

  socket.on("deliveryAssigned", (data) => {
    toast.success("New delivery assigned 🚚");
    fetchOrders(true);
  });

  socket.on("orderTimelineUpdate", (data) => {
  fetchOrders(true)
  
    
});

  return () => {
    socket.off("deliveryAssigned");
    socket.off("orderTimelineUpdate");
  };
}, [user]);

  

  const getStatusColor = (status) => {
    switch(status) {
      case "PICKED_UP": return "bg-blue-100 text-blue-700";
      case "OUT_FOR_DELIVERY": return "bg-purple-100 text-purple-700";
      case "DELIVERED": return "bg-green-100 text-green-700";
      case "DELIVERY_ASSIGNED": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "PICKED_UP": return <FaTruck className="text-blue-600" />;
      case "OUT_FOR_DELIVERY": return <FaLocationArrow className="text-purple-600" />;
      case "DELIVERED": return <FaCheckCircle className="text-green-600" />;
      case "DELIVERY_ASSIGNED": return <FaClock className="text-orange-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

   const getNextAction = (status) => {
    switch(status) {
      case "DELIVERY_ASSIGNED": 
      return { action: "PICKED_UP", label: "Pick Order" };
      case "PICKED_UP": 
      return { action: "DELIVERED", label: "Mark Delivered" };
    //   case "READY": 
    //   return { action: "PICKED_UP", label: "Pick Order" };
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DeliveryLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Delivery Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Welcome back, {user?.name || "Delivery Partner"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <FaSpinner className={`text-sm ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaMotorcycle className="text-blue-600 text-xl" />
              </div>
              <FaChartLine className="text-gray-300 text-xl" />
            </div>
            <p className="text-gray-500 text-sm">Total Deliveries</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalDeliveries}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaWallet className="text-green-600 text-xl" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Total Earnings</p>
            <p className="text-2xl font-bold text-green-600">₹{stats.totalEarnings.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FaClock className="text-orange-600 text-xl" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Active Orders</p>
            <p className="text-2xl font-bold text-orange-600">{stats.activeOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaStar className="text-purple-600 text-xl" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">Rating</p>
            <p className="text-2xl font-bold text-purple-600">{stats.averageRating || "N/A"} ★</p>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm opacity-90">Today's Summary</p>
              <p className="text-2xl font-bold">{stats.completedToday} Deliveries Completed</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Today's Earnings</p>
              <p className="text-3xl font-bold">₹{stats.todayEarnings }</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaShoppingBag className="text-red-500" />
            Assigned Orders
          </h2>
          
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMotorcycle className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Assigned Orders</h3>
              <p className="text-gray-500">You don't have any active deliveries at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const nextAction = getNextAction(order.status);
                return (
                  <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                            <FaShoppingBag className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="font-mono text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <FaUtensils className="text-gray-400 text-xs" />
                              <p className="font-medium text-gray-800">{order.vendorId?.restaurantName || "Restaurant"}</p>
                            </div>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status.replace("_", " ")}</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-red-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-400">Pickup Location</p>
                            <p className="text-sm text-gray-600">{order.vendorId?.address
                            ? `${order.vendorId.address.street},
                            ${order.vendorId.address.city} ` 
                            : "Address not available"}, 
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FaLocationArrow className="text-green-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-400">Delivery Location</p>
                            <p className="text-sm text-gray-600">{order.deliveryAddress?.street
                            ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
                            : order.deliveryAddress|| "Address not provided"} </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FaRupeeSign className="text-gray-400 text-sm" />
                            <span className="font-semibold text-gray-800">₹{order.totalAmount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaClock className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FaEye />
                            Details
                          </button>
                          {nextAction && (
                            <button
                              onClick={() => updateOrderStatus(order._id, nextAction.action)}
                              disabled={updatingOrderId === order._id}
                              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                            >
                              {updatingStatus ? <FaSpinner className="animate-spin" /> : <FaArrowRight />}
                              {nextAction.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Details #{selectedOrder._id.slice(-8)}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUser className="text-red-500" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedOrder.customerId?.name || "Customer"}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedOrder.customerId?.phone || "N/A"}</p>
                    <p><span className="text-gray-500">Delivery Address:</span> {selectedOrder.deliveryAddress || "Address not specified"}</p>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUtensils className="text-red-500" />
                    Restaurant Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Restaurant:</span> {selectedOrder.vendorId?.restaurantName || "Restaurant"}</p>
                    <p><span className="text-gray-500">Pickup Address:</span> {selectedOrder.vendorId?.address?.street || "Restaurant Address"}</p>
                    <p><span className="text-gray-500">Contact:</span> {selectedOrder.vendorId?.phone || "N/A"}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaBoxOpen className="text-red-500" />
                    Order Items
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-800">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-800">Total Amount</span>
                      <span className="font-bold text-xl text-red-600">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaClock className="text-red-500" />
                      Order Timeline
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{event.status.replace("_", " ")}</p>
                            <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                            {event.message && <p className="text-xs text-gray-500 mt-1">{event.message}</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </DeliveryLayout>
  );
};

export default DeliveryDashboard;