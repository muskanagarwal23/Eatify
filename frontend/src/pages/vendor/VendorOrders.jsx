import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaUtensils,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaStar,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
} from "react-icons/fa";
import toast from "react-hot-toast";
import {
  getVendorOrders,
  UpdateOrderStatus,
} from "../../features/vendor/vendorAPI";
import VendorLayout from "../../components/vendor/VendorLayout";
import { getSocket } from "../../sockets/socket";

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const vendorId = localStorage.getItem("vendorId"); // or from profile
    socket.emit("joinVendorRoom", vendorId);

    socket.on("newOrder", (order) => {
      toast.success("New Order Received 🔥");
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)),
      );
    });

    socket.on("orderTimelineUpdate", (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId ? { ...o, status: data.status } : o,
        ),
      );

      toast.success(`Order ${data.status.replace("_", " ")}`);
    });

    socket.on("deliveryAssigned", () => {
      toast.success("🚚 Delivery partner assigned!");
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderUpdated");
      socket.off("orderTimelineUpdate");
socket.off("deliveryAssigned");
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getVendorOrders();

      const data = res.data || [];
      setOrders(data);

      const socket = getSocket();
      if (socket) {
        data.forEach((order) => {
          socket.emit("joinOrderRoom", order._id);
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const freshOrder = orders.find((o) => o._id === selectedOrder?._id);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await UpdateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);

      setShowModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };



  const getStatusColor = (status) => {
    const colors = {
      PLACED: "bg-gray-100 text-gray-700",
      PAID: "bg-blue-100 text-blue-700",
      ACCEPTED: "bg-cyan-100 text-cyan-700",
      REJECTED: "bg-red-100 text-red-700",
      PREPARING: "bg-orange-100 text-orange-700",
      READY: "bg-yellow-100 text-yellow-700",
      DELIVERY_ASSIGNED: "bg-purple-100 text-purple-700",
      PICKED_UP: "bg-indigo-100 text-indigo-700",
      OUT_FOR_DELIVERY: "bg-pink-100 text-pink-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PLACED":
        return <FaClock className="text-gray-600" />;
      case "PAID":
        return <FaCheckCircle className="text-blue-600" />;
      case "ACCEPTED":
        return <FaCheckCircle className="text-cyan-600" />;
      case "REJECTED":
        return <FaTimesCircle className="text-red-600" />;
      case "PREPARING":
        return <FaUtensils className="text-orange-600" />;
      case "READY":
        return <FaUtensils className="text-yellow-600" />;
      case "DELIVERY_ASSIGNED":
        return <FaTruck className="text-purple-600" />;
      case "PICKED_UP":
        return <FaTruck className="text-indigo-600" />;
      case "OUT_FOR_DELIVERY":
        return <FaTruck className="text-pink-600" />;
      case "DELIVERED":
        return <FaCheckCircle className="text-green-600" />;
      case "CANCELLED":
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const getNextStatuses = (currentStatus) => {
    if (["PLACED", "PAID"].includes(currentStatus)) {
      return ["ACCEPTED", "REJECTED"];
    }
    if (currentStatus === "ACCEPTED") {
      return ["PREPARING"];
    }
    if (currentStatus === "PREPARING") {
      return ["READY"];
    }
    return [];
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "ALL" || order.status === filter;
    const matchesSearch =
      (order._id?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.customerId?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.items || []).some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => ["PLACED", "PAID"].includes(o.status))
        .length,
      preparing: orders.filter((o) =>
        ["ACCEPTED", "PREPARING", "READY"].includes(o.status),
      ).length,
      delivering: orders.filter((o) =>
        ["DELIVERY_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(
          o.status,
        ),
      ).length,
      completed: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter(
        (o) => o.status === "CANCELLED" || o.status === "REJECTED",
      ).length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-24 bg-gray-200 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-20 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <VendorLayout>
      <div className="min-w-0 space-y-6 w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Order Management
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage customer orders
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:shadow-md transition-all"
          >
            <FaSync className={`text-sm ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-gray-500">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
            <p className="text-xs text-gray-400 mt-1">Awaiting action</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm">Preparing</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.preparing}
            </p>
            <p className="text-xs text-gray-400 mt-1">In kitchen</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Delivering</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.delivering}
            </p>
            <p className="text-xs text-gray-400 mt-1">On the way</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
            <p className="text-xs text-gray-400 mt-1">Delivered</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-red-600">
              ₹{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total earnings</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer name, or Item..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              "ALL",
              "PLACED",
              "PAID",
              "ACCEPTED",
              "PREPARING",
              "DELIVERY_ASSIGNED",
              "READY",
              "PICKED_UP",
              "OUT_FOR_DELIVERY",
              "DELIVERED",
              "CANCELLED",
              "REJECTED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  filter === status
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {status === "ALL"
                  ? "All Orders"
                  : status.replace("_", " ").toLowerCase()}
                {status !== "ALL" && (
                  <span className="ml-2 text-xs opacity-75">
                    ({orders.filter((o) => o.status === status).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {paginatedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== "ALL"
                ? "Try adjusting your search or filters"
                : "You haven't received any orders yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="w-full overflow-x-auto rounded-xl">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-left text-gray-600 text-sm">
                      <th className="px-6 py-4 font-semibold">Order ID</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Items</th>
                      <th className="px-6 py-4 font-semibold">Total</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-600">
                            #{order._id.slice(-8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {order.customerId?.name || "Guest"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {order.customerId?.phone || "No phone"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate">
                              {(order.items || [])
                                .map((i) => `${i.name} (x${i.quantity})`)
                                .join(", ")}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {(order.items || []).length} 
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">
                            ₹{order.totalAmount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status
                              .replace("_", " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
                          >
                            <FaEye />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FaChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
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
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                {/* Order Status and Actions */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Update Order Status
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {getNextStatuses(freshOrder.status).map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, status)
                        }
                        disabled={updatingStatus}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          status === "REJECTED"
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        } disabled:opacity-50`}
                      >
                        {updatingStatus ? (
                          <FaSpinner className="animate-spin inline mr-1" />
                        ) : null}
                        Mark as{" "}
                        {status
                          .replace("_", " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </button>
                    ))}
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(freshOrder.status)}`}
                    >
                      {getStatusIcon(freshOrder.status)}
                      Current: {freshOrder.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaUser className="text-red-500" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-500">Name:</span>{" "}
                        {selectedOrder.customerId?.name || "Guest"}
                      </p>
                      <p>
                        <span className="text-gray-500">Email:</span>{" "}
                        {selectedOrder.customerId?.email || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-500">Phone:</span>{" "}
                        {selectedOrder.customerId?.phone || "N/A"}
                      </p>
                      {selectedOrder.deliveryAddress && (
                        <p>
                          <span className="text-gray-500">Address:</span>{" "}
                          {selectedOrder.deliveryAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Partner Information */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaTruck className="text-red-500" />
                      Delivery Information
                    </h3>
                    {freshOrder.deliveryPartnerId ? (
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-500">Partner:</span>{" "}
                          {freshOrder.deliveryPartnerId?.name || "Assigning.."}
                        </p>
                        <p>
                          <span className="text-gray-500">Phone:</span>{" "}
                          {freshOrder.deliveryPartnerId.phone}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No delivery partner assigned yet
                      </p>
                    )}
                    <p className="text-sm mt-2">
                      <span className="text-gray-500">Order Date:</span>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaUtensils className="text-red-500" />
                    Order Items
                  </h3>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <p className="font-medium text-gray-800">
                          {item.name || item.menuItem.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
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

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaRupeeSign className="text-red-500" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Payment Status</p>
                      <p
                        className={`font-medium ${selectedOrder.payment?.status === "PAID" ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {selectedOrder.payment?.status || "PENDING"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-800">Razorpay</p>
                    </div>
                  </div>
                </div>

                {/* Rating & Review */}
                {selectedOrder.rating?.value && (
                  <div className="bg-yellow-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      Customer Feedback
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < selectedOrder.rating.value
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="text-sm text-gray-600">
                        ({selectedOrder.rating.value}/5)
                      </span>
                    </div>
                    {selectedOrder.rating.review && (
                      <p className="text-gray-600 italic">
                        "{selectedOrder.rating.review}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;
