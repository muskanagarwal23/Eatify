// Orders.jsx
import { useEffect, useState } from "react";
import { getMyOrders, cancelOrder } from "../../features/orders/orderAPI";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../sockets/socket";
import {
  FaClock,
  FaMotorcycle,
  FaCheckCircle,
  FaRedo,
  FaShoppingBag,
  FaStar,
  FaStarHalfAlt,
  FaTruck,
  FaUtensils,
  FaHourglassHalf,
  FaArrowLeft,
  FaFilter,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { createReviews } from "../../features/review/reviewAPI";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState({
    orderId: null,
    value: 0,
    review: "",
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const navigate = useNavigate();

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.log(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Real-time socket updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("orderTimelineUpdate", (data) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId
            ? {
                ...order,
                status: data.status,
                timeline: [...(order.timeline || []), data],
              }
            : order,
        ),
      );
    });

    socket.on("reviewReply", (data) => {
      toast.success("Vendor replied to your review!");
      setOrders(prev => 
        prev.map(order => 
          order._id === data.orderId 
          ? {
            ...order,
            review: {
              ...order.review,
              reply:data.reply
            }
          }
          :order
        )
      );
    });

    return () => socket.off("orderTimelineUpdate", "reviewReply");
  }, []);

  // Filters
  const filteredOrders = orders.filter((order) => {
    if (filter === "ACTIVE") {
      return order.status !== "DELIVERED" && order.status !== "CANCELLED";
    }
    if (filter === "DELIVERED") {
      return order.status === "DELIVERED";
    }
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "PICKED_UP":
        return "bg-blue-100 text-blue-700";
      case "DELIVERY_ASSIGNED":
        return "bg-purple-100 text-purple-700";
      case "PREPARING":
        return "bg-orange-100 text-orange-700";
      case "READY":  
        return "bg-brown-100 text-brown-700";
      case "ACCEPTED":
        return "bg-yellow-100 text-yellow-700";
      case "PLACED":
        return "bg-gray-100 text-gray-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DELIVERED":
        return <FaCheckCircle className="text-green-600" />;
      case "PICKED_UP":
      case "DELIVERY_ASSIGNED":
        return <FaMotorcycle className="text-purple-600" />;
      case "PREPARING":
        return <FaUtensils className="text-orange-600" />;
      case "READY":  
        return <FaUtensils className="text-orange-600" />;

      case "CANCELLED":
        return <FaHourglassHalf className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const handleReorder = (order) => {
    localStorage.setItem("reorderItems", JSON.stringify(order.items));
    navigate("/cart");
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(id);
        fetchOrders();
        toast.success("Order cancelled");
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
      }
    }
  };

  const handleSubmitRating = async () => {
    try {
      const res = await createReviews({
        orderId: ratingData.orderId,
        rating: ratingData.value,
        review: ratingData.review,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === ratingData.orderId
            ? { ...order, review: res.data } // ✅ FIXED
            : order,
        ),
      );

      setRatingData({ orderId: null, value: 0, review: "" });

      toast.success("Thanks for your feedback!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const getOrderSummary = (order) => {
    const items = order.items || [];
    const itemNames = items.map((i) => i.menuItem?.name || i.name).join(", ");
    return itemNames.length > 50
      ? itemNames.substring(0, 50) + "..."
      : itemNames;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-10 bg-gray-200 rounded-full w-24"
                  ></div>
                ))}
              </div>
              <div className="space-y-4 mt-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-gray-100 rounded-xl p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4 md:hidden"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back</span>
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                My Orders
              </h1>
              <p className="text-gray-500 mt-1">
                Track and manage all your orders
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/browse")}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                <FaShoppingBag />
                Back to Browse
              </button>
            </div>
          </div>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden md:flex gap-3 mb-6 overflow-x-auto pb-2">
          {["ALL", "ACTIVE", "DELIVERED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f === "ALL"
                ? "All Orders"
                : f === "ACTIVE"
                  ? "Active Orders"
                  : "Delivered"}
              {f === "ALL" && orders.length > 0 && (
                <span className="ml-2 text-sm opacity-75">
                  ({orders.length})
                </span>
              )}
              {f === "ACTIVE" &&
                orders.filter(
                  (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED",
                ).length > 0 && (
                  <span className="ml-2 text-sm opacity-75">
                    (
                    {
                      orders.filter(
                        (o) =>
                          o.status !== "DELIVERED" && o.status !== "CANCELLED",
                      ).length
                    }
                    )
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* Filters - Mobile */}
        <div className="md:hidden mb-6 relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="w-full flex items-center justify-between bg-white px-5 py-3 rounded-full shadow-sm border border-gray-200"
          >
            <span className="font-medium text-gray-700">
              {filter === "ALL"
                ? "All Orders"
                : filter === "ACTIVE"
                  ? "Active Orders"
                  : "Delivered"}
            </span>
            <FaFilter className="text-gray-500" />
          </button>
          {showFilterMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
              {["ALL", "ACTIVE", "DELIVERED"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-5 py-3 text-left transition-colors ${
                    filter === f
                      ? "bg-red-50 text-red-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {f === "ALL"
                    ? "All Orders"
                    : f === "ACTIVE"
                      ? "Active Orders"
                      : "Delivered"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-5 flex gap-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No orders found
            </h2>
            <p className="text-gray-500 mb-6">
              {filter !== "ALL"
                ? `You don't have any ${filter.toLowerCase()} orders`
                : "You haven't placed any orders yet"}
            </p>
            <button
              onClick={() => navigate("/browse")}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              // console.log("ORDER DEBUG:", {
              //   id: order._id,
              //   status: order.status,
              //   review: order.review,
              // });

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
                >
                  <button onClick={() => navigate(`/order/${order._id}`)}>
                    View Details
                  </button>
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            order.items[0]?.menuItem?.image?.img_url ||
                            order.items[0]?.menuItem?.imageUrl ||
                            order.items[0]?.image ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                          }
                          className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
                          alt=""
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">
                              {order.vendorId?.name || "Restaurant"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {getOrderSummary(order)}
                            </p>
                          </div>
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}

                            <span>{order.status}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                          <span>
                            📅 {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            ⏰{" "}
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="font-semibold text-gray-800">
                            💰 ₹{order.totalAmount}
                          </span>
                        </div>

                        {order.deliveryPartnerId && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <FaTruck className="text-green-500" />
                              Delivery by:{" "}
                              <span className="font-medium">
                                {order.deliveryPartnerId.name}
                              </span>
                              {order.deliveryPartnerId.phone && (
                                <span className="text-gray-500">
                                  | 📞 {order.deliveryPartnerId.phone}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        {/* Rating Section */}
                        {order.status?.toUpperCase() === "DELIVERED" &&
                          !(
                            order.review &&
                            order.review.rating &&
                            order.review.rating.value
                          ) && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Rate your order:
                              </p>
                              <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRatingData({
                                        orderId: order._id,
                                        value: star,
                                        review:
                                          ratingData.orderId === order._id
                                            ? ratingData.review
                                            : "",
                                      });
                                    }}
                                    className="text-2xl focus:outline-none"
                                  >
                                    <FaStar
                                      className={`${
                                        ratingData.orderId === order._id &&
                                        ratingData.value >= star
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      } hover:text-yellow-400 transition-colors`}
                                    />
                                  </button>
                                ))}
                              </div>

                              {ratingData.orderId === order._id &&
                                ratingData.value > 0 && (
                                  <div className="space-y-2 mt-2">
                                    <textarea
                                      placeholder="Write your feedback (optional)..."
                                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:border-red-400 focus:outline-none"
                                      rows="2"
                                      value={ratingData.review}
                                      onChange={(e) =>
                                        setRatingData({
                                          ...ratingData,
                                          review: e.target.value,
                                        })
                                      }
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubmitRating();
                                      }}
                                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                                    >
                                      Submit Rating
                                    </button>
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/reviews/${order.vendorId?._id}`,
                                        )
                                      }
                                      className="text-sm text-red-500 mt-2"
                                    >
                                      View All Reviews
                                    </button>
                                  </div>
                                )}
                            </div>
                          )}

                        {order.review?.rating?.value && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex gap-1">
                              {renderStars(order.review.rating.value)}
                            </div>
                            {order.review.rating.review && (
                              <span className="text-xs text-gray-500">
                                "{order.review.rating.review}"
                              </span>
                            )}
                          </div>
                        )}
                        {order.review?.reply && (
                          <div className="mt-2 bg-green-50 p-2 rounded text-sm">
                            <span className="font-medium text-green-700">
                              Vendor Reply:
                            </span>{" "}
                            {order.review.reply}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2 justify-end md:justify-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            localStorage.setItem("orderId", order._id);
                            navigate("/track");
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                        >
                          Track
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorder(order);
                          }}
                          className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-all flex items-center gap-1 justify-center"
                        >
                          <FaRedo /> Reorder
                        </button>

                        {!["PICKED_UP", "DELIVERED", "CANCELLED"].includes(
                          order.status,
                        ) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(order._id);
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                          >
                            Cancel
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
    </div>
  );
};

export default Orders;
