// DeliveryOrders.jsx
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
  FaTimesCircle,
  FaArrowRight,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaBoxOpen,
  FaWallet,
  FaThumbsUp,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import toast from "react-hot-toast";
import DeliveryLayout from "../../components/delivery/DeliveryLayout";
import { getSocket } from "../../sockets/socket";
import {
  getAssignedOrders,
  updateStatus,
} from "../../features/delivery/deliveryAPI";

const DeliveryOrders = () => {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user?.role !== "DELIVERY") {
      navigate("/");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("orderTimelineUpdate", () => {
      fetchOrders(true); // silent refresh
    });

    return () => {
      socket.off("orderTimelineUpdate");
    };
  }, []);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await getAssignedOrders();
      const data = res.data;

      const ordersData = Array.isArray(data) ? data : data.orders || [];

      // ✅ Only history orders
      const historyOrders = ordersData.filter((o) =>
        ["DELIVERED", "CANCELLED"].includes(o.status),
      );

      setOrders(historyOrders);
      setFilteredOrders(historyOrders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    setUpdatingOrderId(orderId);
    try {
      const res = await updateStatus(orderId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PICKED_UP":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "DELIVERY_ASSIGNED":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const buttonColors = {
    blue: "bg-blue-500 hover:bg-blue-600",
    purple: "bg-purple-500 hover:bg-purple-600",
    green: "bg-green-500 hover:bg-green-600",
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PICKED_UP":
        return <FaTruck className="text-blue-600" />;
      case "OUT_FOR_DELIVERY":
        return <FaLocationArrow className="text-purple-600" />;
      case "DELIVERED":
        return <FaCheckCircle className="text-green-600" />;
      case "DELIVERY_ASSIGNED":
        return <FaClock className="text-orange-600" />;
      case "CANCELLED":
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case "DELIVERY_ASSIGNED":
        return {
          action: "PICKED_UP",
          label: "Mark as Picked Up",
          color: "blue",
        };
      case "PICKED_UP":
        return {
          action: "OUT_FOR_DELIVERY",
          label: "Start Delivery",
          color: "purple",
        };
      case "OUT_FOR_DELIVERY":
        return {
          action: "DELIVERED",
          label: "Mark as Delivered",
          color: "green",
        };
      default:
        return null;
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      { status: "DELIVERY_ASSIGNED", label: "Assigned", icon: <FaClock /> },
      { status: "PICKED_UP", label: "Picked Up", icon: <FaTruck /> },
      {
        status: "OUT_FOR_DELIVERY",
        label: "Out for Delivery",
        icon: <FaLocationArrow />,
      },
      { status: "DELIVERED", label: "Delivered", icon: <FaCheckCircle /> },
    ];

    let currentIndex = steps.findIndex((s) => s.status === currentStatus);
    if (currentIndex === -1 && currentStatus === "DELIVERED") currentIndex = 3;
    if (currentIndex === -1 && currentStatus === "CANCELLED") currentIndex = -2;

    return steps.map((step, idx) => ({
      ...step,
      isCompleted: idx <= currentIndex,
      isCurrent: step.status === currentStatus,
    }));
  };

  // Filter and search
  useEffect(() => {
    let filtered = [...orders];

    if (filter !== "ALL") {
      filtered = filtered.filter((order) => order.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.vendorId?.restaurantName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerId?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [filter, searchTerm, orders]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusCount = (status) => {
    if (status === "ALL") return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DeliveryLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Deliveries</h1>
            <p className="text-gray-500 mt-1">
              Manage and track your assigned deliveries
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:shadow-md transition-all"
          >
            <FaSpinner className={`text-sm ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Restaurant, or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              "ALL",
              "DELIVERY_ASSIGNED",
              "PICKED_UP",
              "OUT_FOR_DELIVERY",
              "DELIVERED",
              "CANCELLED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  filter === status
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {status === "ALL" ? "All Orders" : status.replace("_", " ")}
                <span className="ml-2 text-xs opacity-75">
                  ({getStatusCount(status)})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {paginatedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMotorcycle className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== "ALL"
                ? "Try adjusting your search or filters"
                : "You don't have any assigned deliveries at the moment"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedOrders.map((order) => {
                const nextAction = getNextAction(order.status);
                const statusSteps = getStatusSteps(order.status);

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                            <FaShoppingBag className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="font-mono text-sm text-gray-500">
                              Order #{order._id.slice(-8)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <FaUtensils className="text-gray-400 text-xs" />
                              <p className="font-medium text-gray-800">
                                {order.vendorDetails?.restaurantName ||
                                  "Restaurant not Available"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          <span>{order.status.replace("_", " ")}</span>
                        </div>
                      </div>

                      {/* Progress Steps */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between">
                          {statusSteps.map((step, idx) => (
                            <div key={idx} className="flex-1 text-center">
                              <div
                                className={`flex items-center justify-center mb-2 ${step.isCompleted ? "text-green-500" : "text-gray-300"}`}
                              >
                                {step.icon}
                              </div>
                              <p
                                className={`text-xs font-medium ${step.isCompleted ? "text-green-600" : "text-gray-400"}`}
                              >
                                {step.label}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="relative mt-2">
                          <div className="absolute top-0 left-0 h-1 bg-gray-200 rounded-full w-full"></div>
                          <div
                            className="absolute top-0 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${(statusSteps.filter((s) => s.isCompleted).length / statusSteps.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Location Info */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">
                              Pickup Location
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.vendorId?.address
                                ? `${order.vendorId.address.street}, ${order.vendorId.address.city}`
                                : "Address not available"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FaLocationArrow className="text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-400">
                              Delivery Location
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.deliveryAddress || "Address not available"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FaRupeeSign className="text-gray-400 text-sm" />
                            <span className="font-semibold text-gray-800">
                              ₹{order.totalAmount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaClock className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
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
                          {nextAction && order.status !== "DELIVERED" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order._id, nextAction.action)
                              }
                              disabled={updatingOrderId === order._id}
                              className={`flex-1 md:flex-none flex items-center justify-center gap-2 ${buttonColors[nextAction.color]} text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50`}
                            >
                              {updatingStatus ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaArrowRight />
                              )}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FaChevronLeft />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}

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
                {/* Status Timeline */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaClock className="text-red-500" />
                    Delivery Progress
                  </h3>
                  <div className="space-y-3">
                    {getStatusSteps(selectedOrder.status).map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.isCompleted ? "bg-green-500" : "bg-gray-200"
                          }`}
                        >
                          {step.isCompleted ? (
                            <FaCheckCircle className="text-white text-sm" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium ${step.isCompleted ? "text-green-600" : "text-gray-500"}`}
                          >
                            {step.label}
                          </p>
                          {step.isCurrent && step.status !== "DELIVERED" && (
                            <p className="text-xs text-orange-500">
                              In progress...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUser className="text-red-500" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Name:</span>{" "}
                      {selectedOrder.customerId?.name || "Customer"}
                    </p>
                    <p>
                      <span className="text-gray-500">Phone:</span>{" "}
                      {selectedOrder.customerId?.phone || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-500">Delivery Address:</span>{" "}
                      {selectedOrder.deliveryAddress || "Address not specified"}
                    </p>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUtensils className="text-red-500" />
                    Restaurant Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Restaurant:</span>{" "}
                      {selectedOrder.vendorId?.restaurantName || "Restaurant"}
                    </p>
                    <p>
                      <span className="text-gray-500">Pickup Address:</span>{" "}
                      {selectedOrder.vendorId?.address?.street ||
                        "Restaurant Address"}
                    </p>
                    <p>
                      <span className="text-gray-500">Contact:</span>{" "}
                      {selectedOrder.vendorId?.phone || "N/A"}
                    </p>
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
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-800">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-200">
                      <span className="font-bold text-gray-800">
                        Total Amount
                      </span>
                      <span className="font-bold text-xl text-red-600">
                        ₹{selectedOrder.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Fee */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaWallet className="text-green-600" />
                    Delivery Earnings
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{selectedOrder.deliveryFee || 40}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be added to your wallet upon successful delivery
                  </p>
                </div>

                {/* Action Button */}
                {getNextAction(selectedOrder.status) && (
                  <button
                    onClick={() =>
                      updateOrderStatus(
                        selectedOrder._id,
                        getNextAction(selectedOrder.status).action,
                      )
                    }
                    disabled={updatingStatus}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updatingStatus ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaArrowRight />
                    )}
                    {getNextAction(selectedOrder.status).label}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
};

export default DeliveryOrders;
