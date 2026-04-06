import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getVendorProfile,
  getVendorOrders,
} from "../../features/vendor/vendorAPI";
import {
  FaStore,
  FaMapMarkerAlt,
  FaStar,
  FaRupeeSign,
  FaShoppingBag,
  FaUsers,
  FaChartLine,
  FaClock,
  FaEye,
  FaEdit,
  FaPlus,
  FaBell,
  FaDownload,
  FaCalendarAlt,
  FaChevronRight,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaAdversal,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import VendorLayout from "../../components/vendor/VendorLAyout";
import { getSocket } from "../../sockets/socket";

const VendorDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [vendorData, setVendorData] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [growthOrders, setGrowthOrders] = useState(0);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    popularItems: [],
  });

 

  useEffect(() => {
    if (!user) return;
    
    //console.log("VENDOR DATA:", vendorData);
    if (user.role !== "VENDOR") {
      navigate("/", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [profileRes, ordersRes] = await Promise.all([
          getVendorProfile(),
          getVendorOrders(),
        ]);

        const profile = profileRes.data;
        const orders = ordersRes.data;

        setOrders(orders);
        setVendorData(profile);

        // ===== STATS =====
        const totalOrders = orders.length;
        const validRevenueOrders = orders.filter(
          (o) => o.status === "PREPARING",
        );
        const totalRevenue = validRevenueOrders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0,
        );

        const completed = orders.filter((o) => o.status === "DELIVERED").length;
        const pending = orders.filter((o) =>
          ["PLACED", "ACCEPTED", "PREPARING"].includes(o.status),
        ).length;
        const cancelled = orders.filter((o) => 
          o.status === "CANCELLED" || o.status === "REJECTED").length;

        const totalCustomers = new Set(
          orders.map((o) => o.customerId?._id || o.customerId),
        ).size;

        // ===== POPULAR ITEMS =====
        const itemMap = {};
        orders.forEach((order) => {
          order.items?.forEach((item) => {
            const name = item.name;
            if (!itemMap[name]) {
              itemMap[name] = { name, orders: 0, revenue: 0 };
            }
            itemMap[name].orders += item.quantity;
            itemMap[name].revenue += item.price * item.quantity;
          });
        });

        const popularItems = Object.values(itemMap)
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 5);

        // ===== MONTHLY DATA =====
        const monthly = {};
        const monthlyStats = {};

        orders.forEach((o) => {
          const date = new Date(o.createdAt);
          const monthName = date.toLocaleString("default", { month: "short" });
          const monthIndex = date.getMonth();

          if (!monthly[monthName]) {
            monthly[monthName] = { month: monthName, orders: 0, revenue: 0 };
          }

          if (!monthlyStats[monthIndex]) {
            monthlyStats[monthIndex] = { orders: 0, revenue: 0 };
          }

          monthly[monthName].orders += 1;
          if (o.status === "PREPARING") {
            monthly[monthName].revenue += o.totalAmount || 0;
          }

          monthlyStats[monthIndex].orders += 1;
          monthlyStats[monthIndex].revenue += o.totalAmount || 0;
        });

        setOrdersData(Object.values(monthly));

        // ===== GROWTH =====
        const currentMonth = new Date().getMonth();
        const prevMonth = currentMonth - 1;

        const growth = monthlyStats[prevMonth]
          ? (((monthlyStats[currentMonth]?.orders || 0) -
              monthlyStats[prevMonth].orders) /
              monthlyStats[prevMonth].orders) *
            100
          : 0;

        setGrowthOrders(growth);

        // ===== FINAL STATE =====
        setStats({
          totalOrders,
          totalRevenue,
          averageRating: profile.rating || 0,
          totalCustomers,
          pendingOrders: pending,
          completedOrders: completed,
          cancelledOrders: cancelled,
          popularItems,
        });
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    console.log("FINAL DATA:", vendorData);
    fetchData();
  }, [user?.role]);

   useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  socket.on("orderUpdated", (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === updatedOrder._id ? updatedOrder : o
      )
    );
  });

  socket.on("newOrder", (order) => {
    setOrders((prev) => [order, ...prev]);
  });

  return () => {
    socket.off("orderUpdated");
    socket.off("newOrder");
  };
}, []);

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

  const orderStatusData = [
    { name: "Completed", value: stats.completedOrders },
    { name: "Pending", value: stats.pendingOrders },
    { name: "Cancelled", value: stats.cancelledOrders },
  ];

  const cancelled = orders.filter(
    (o) => o.status === "CANCELLED" || o.status === "REJECTED",
  ).length;

  const pending = orders.filter((o) =>
  ["PLACED", "PAID", "ACCEPTED", "PREPARING"].includes(o.status)
).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center py-16">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <FaStore className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Vendor Profile Not Found
            </h2>
            <p className="text-gray-500">
              Please complete your vendor registration
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-red-500 gap-2"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VendorLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Vendor Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Welcome back, {vendorData.restaurantName}
              </p>
            </div>
          </div>

          {/* Restaurant Info Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
            <div className="relative h-40 bg-gradient-to-r from-red-500 to-orange-500">
              <img
                src={vendorData.bannerUrl}
                onError={(e) => {
                  e.target.src =
                    "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                }}
                alt={vendorData.restaurantName}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all">
                <FaEdit />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {vendorData.restaurantName}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                          <FaStar className="text-yellow-400 text-xs" />
                          <span className="text-sm font-medium text-green-700">
                            {vendorData.rating || 0}
                          </span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <FaRupeeSign className="text-gray-500 text-xs" />
                          <span className="text-sm text-gray-600">
                            Cost for two: ₹{vendorData.avgPrice}
                          </span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <FaClock className="text-gray-500 text-xs" />
                          <span className="text-sm text-gray-600">
                            {vendorData.deliveryTime
                              ? `${vendorData.deliveryTime}`
                              : "N/A"}{" "}
                            min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaAdversal className="text-gray-500 text-xs" />
                        <span className="text-sm text-gray-600">
                          {vendorData.description || "N/A"}{" "}
                        </span>
                      </div>
                    </div>
                    {vendorData.isOpen ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        Open Now
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-red-400" />
                      <span className="text-sm">
                        {vendorData.address
                          ? `${vendorData.address.street || ""}, ${vendorData.address.city || ""}, ${vendorData.address.state || ""}`
                          : "No address available"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="text-sm">
                        Joined{" "}
                        {vendorData.createdAt
                          ? new Date(vendorData.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(vendorData.cuisine)
                      ? vendorData.cuisine.map((cuisine, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full"
                          >
                            {cuisine}
                          </span>
                        ))
                      : vendorData.cuisineType && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {vendorData.cuisine}
                          </span>
                        )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaShoppingBag className="text-red-500 text-xl" />
                </div>
                {/*<FaTrendingUp className="text-green-500 text-sm" />*/}
              </div>
              <h3 className="text-gray-500 text-sm">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalOrders}
              </p>
              <p className="text-xs text-green-600 mt-2">
                ↑ 12% from last month
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaRupeeSign className="text-orange-500 text-xl" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-2">
                ↑ {growthOrders.toFixed(1)}% from last month{" "}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaStar className="text-yellow-500 text-xl" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm">Average Rating</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.averageRating} ★
              </p>
              <p className="text-xs text-green-600 mt-2">Based on reviews</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaUsers className="text-green-500 text-xl" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm">Total Customers</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalCustomers}
              </p>
              <p className="text-xs text-green-600 mt-2">
                ↑ 5.2% from last month
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Orders Trend */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Orders Trend
                </h3>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
                  <option>Last 6 months</option>
                  <option>Last 12 months</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#EF4444"
                    fill="#FEE2E2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Revenue Trend
                </h3>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
                  <option>Last 6 months</option>
                  <option>Last 12 months</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F97316"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status and Popular Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Order Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <FaCheckCircle />
                    <span className="text-sm">Completed</span>
                  </div>
                  <p className="font-bold text-gray-800">
                    {stats.completedOrders}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-600">
                    <FaHourglassHalf />
                    <span className="text-sm">Pending</span>
                  </div>
                  <p className="font-bold text-gray-800">
                    {stats.pendingOrders}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600">
                    <FaTimesCircle />
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <p className="font-bold text-gray-800">
                    {stats.cancelledOrders}
                  </p>
                </div>
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Popular Menu Items
              </h3>
              <div className="space-y-4">
                {stats.popularItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaShoppingBag className="text-xs" />
                          {item.orders} orders
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FaRupeeSign className="text-xs" />
                          {item.revenue.toLocaleString()} revenue
                        </span>
                      </div>
                    </div>
                    <div className="w-20 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {Math.round((item.orders / stats.totalOrders) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
              <button
                className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1"
                onClick={() => navigate("/vendor/orders")}
              >
                View All <FaChevronRight className="text-xs" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="text-left text-gray-500 text-sm">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 text-sm font-mono text-gray-600">
                        # {order._id.slice(-6)}
                      </td>
                      <td className="py-3 text-sm text-gray-700">
                        {order.customerId?.name || "User"}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {order.items?.length || 0}
                      </td>
                      <td className="py-3 text-sm font-medium text-gray-800">
                        ₹{order.totalAmount}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-700"
                              : order.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : order.status === "PREPARING"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          className="text-red-500 text-sm hover:text-red-600"
                          onClick={() => navigate("/vendor/orders")}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};
export default VendorDashboard;
