// DeliveryEarnings.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaWallet,
  FaRupeeSign,
  FaCalendarAlt,
  FaMotorcycle,
  FaShoppingBag,
  FaStar,
  FaChartLine,
  FaDownload,
  FaFilter,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaReceipt,
  FaMoneyBillWave,
  
  FaCreditCard,
  FaHistory,
  FaTrophy,
  FaMedal
} from "react-icons/fa";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import toast from "react-hot-toast";
import DeliveryLayout from "../../components/delivery/DeliveryLayout";

const DeliveryEarnings = () => {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    pending: 0,
    completed: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [earningsData, setEarningsData] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user?.role !== "DELIVERY") {
      navigate("/");
      return;
    }
    fetchEarnings();
  }, [user, navigate]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      // Simulate API call - Replace with actual API endpoint
      // const response = await fetch("/api/delivery/earnings", {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Sample data - Replace with actual API response
      setTimeout(() => {
        const sampleEarnings = {
          total: 28450,
          today: 480,
          thisWeek: 3240,
          thisMonth: 12480,
          pending: 1240,
          completed: 27210
        };
        
        const sampleTransactions = [
          { id: "TRX001", orderId: "ORD123456", amount: 120, status: "COMPLETED", date: "2024-01-15T10:30:00", type: "delivery", restaurant: "Pizza Paradise", customer: "John Doe", distance: 3.2, time: 25 },
          { id: "TRX002", orderId: "ORD123457", amount: 80, status: "COMPLETED", date: "2024-01-15T12:45:00", type: "delivery", restaurant: "Burger King", customer: "Jane Smith", distance: 2.1, time: 18 },
          { id: "TRX003", orderId: "ORD123458", amount: 100, status: "PENDING", date: "2024-01-15T14:20:00", type: "delivery", restaurant: "Sushi Master", customer: "Mike Johnson", distance: 4.5, time: 35 },
          { id: "TRX004", orderId: "ORD123459", amount: 90, status: "COMPLETED", date: "2024-01-14T11:15:00", type: "delivery", restaurant: "Taco Bell", customer: "Sarah Wilson", distance: 2.8, time: 22 },
          { id: "TRX005", orderId: "ORD123460", amount: 110, status: "COMPLETED", date: "2024-01-14T13:30:00", type: "delivery", restaurant: "KFC", customer: "David Brown", distance: 3.5, time: 28 },
          { id: "TRX006", orderId: "ORD123461", amount: 70, status: "PENDING", date: "2024-01-13T09:45:00", type: "delivery", restaurant: "Subway", customer: "Emily Davis", distance: 1.8, time: 15 },
          { id: "TRX007", orderId: "ORD123462", amount: 130, status: "COMPLETED", date: "2024-01-13T17:20:00", type: "delivery", restaurant: "Dominos", customer: "Robert Taylor", distance: 4.2, time: 32 },
          { id: "TRX008", orderId: "ORD123463", amount: 95, status: "COMPLETED", date: "2024-01-12T12:00:00", type: "delivery", restaurant: "Starbucks", customer: "Lisa Anderson", distance: 2.5, time: 20 },
          { id: "TRX009", orderId: "ORD123464", amount: 85, status: "COMPLETED", date: "2024-01-12T15:45:00", type: "delivery", restaurant: "McDonald's", customer: "James Martin", distance: 3.0, time: 24 },
          { id: "TRX010", orderId: "ORD123465", amount: 105, status: "COMPLETED", date: "2024-01-11T11:30:00", type: "delivery", restaurant: "Wendy's", customer: "Patricia Lee", distance: 3.8, time: 30 }
        ];
        
        const sampleEarningsData = [
          { day: "Mon", earnings: 450, deliveries: 5 },
          { day: "Tue", earnings: 380, deliveries: 4 },
          { day: "Wed", earnings: 520, deliveries: 6 },
          { day: "Thu", earnings: 490, deliveries: 5 },
          { day: "Fri", earnings: 610, deliveries: 7 },
          { day: "Sat", earnings: 720, deliveries: 8 },
          { day: "Sun", earnings: 680, deliveries: 7 }
        ];
        
        setEarnings(sampleEarnings);
        setTransactions(sampleTransactions);
        setFilteredTransactions(sampleTransactions);
        setEarningsData(sampleEarningsData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
      setLoading(false);
    }
  };

  // Filter transactions
  useEffect(() => {
    let filtered = [...transactions];
    
    if (filter !== "ALL") {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [filter, searchTerm, transactions]);

  const getStatusColor = (status) => {
    switch(status) {
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "FAILED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "COMPLETED": return <FaCheckCircle className="text-green-600" />;
      case "PENDING": return <FaClock className="text-yellow-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const COLORS = ["#EF4444", "#F59E0B", "#10B981"];

  return (
    <DeliveryLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Earnings</h1>
          <p className="text-gray-500 mt-1">Track your delivery earnings and payments</p>
        </div>
        <button
          onClick={fetchEarnings}
          className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:shadow-md transition-all"
        >
          <FaSpinner className={`text-sm ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <FaWallet className="text-3xl opacity-80" />
            <FaChartLine className="text-xl opacity-50" />
          </div>
          <p className="text-sm opacity-90">Total Earnings</p>
          <p className="text-3xl font-bold">₹{earnings.total.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Lifetime earnings</p>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaRupeeSign className="text-green-600 text-xl" />
            </div>
            <FaArrowUp className="text-green-500" />
          </div>
          <p className="text-gray-500 text-sm">Today's Earnings</p>
          <p className="text-2xl font-bold text-gray-800">₹{earnings.today}</p>
          <p className="text-xs text-green-600 mt-2">+12% from yesterday</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="text-orange-600 text-xl" />
            </div>
            <FaArrowUp className="text-orange-500" />
          </div>
          <p className="text-gray-500 text-sm">This Week</p>
          <p className="text-2xl font-bold text-gray-800">₹{earnings.thisWeek}</p>
          <p className="text-xs text-orange-600 mt-2">+8% from last week</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">This Month</p>
          <p className="text-2xl font-bold text-gray-800">₹{earnings.thisMonth}</p>
          <p className="text-xs text-purple-600 mt-2">Projected: ₹{Math.round(earnings.thisMonth * 1.2)}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Completed Deliveries</p>
              <p className="text-2xl font-bold text-blue-700">{earnings.completed / 100}</p>
            </div>
            <FaCheckCircle className="text-blue-500 text-3xl opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-700">₹{earnings.pending}</p>
            </div>
            <FaClock className="text-yellow-500 text-3xl opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Avg per Delivery</p>
              <p className="text-2xl font-bold text-green-700">₹95</p>
            </div>
            <FaMedal className="text-green-500 text-3xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Weekly Earnings Overview</h3>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="earnings" stroke="#EF4444" fill="#FEE2E2" name="Earnings (₹)" />
            <Bar dataKey="deliveries" fill="#F97316" name="Deliveries" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaHistory className="text-red-500" />
                Transaction History
              </h3>
              <p className="text-sm text-gray-500 mt-1">All your delivery payments</p>
            </div>
            <button className="flex items-center gap-2 text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-all">
              <FaDownload />
              Download Report
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-100">
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
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === "ALL"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("COMPLETED")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === "COMPLETED"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === "PENDING"
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {paginatedTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaReceipt className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions found</h3>
            <p className="text-gray-500">Complete deliveries to see your earnings</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-600 text-sm">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Restaurant</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600">
                          {transaction.orderId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{transaction.restaurant}</p>
                        <p className="text-xs text-gray-400">{transaction.distance} km • {transaction.time} min</p>
                       </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{transaction.customer}</p>
                       </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">₹{transaction.amount}</span>
                       </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                        <p className="text-xs text-gray-400">{formatTime(transaction.date)}</p>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowModal(true);
                          }}
                          className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
                        >
                          <FaEye />
                          View
                        </button>
                       </td>
                    </tr>
                  ))}
                </tbody>
               </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Withdrawal Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <FaMoneyBillWave className="text-3xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Available for Withdrawal</h3>
              <p className="text-3xl font-bold mt-1">₹{earnings.completed}</p>
              <p className="text-sm opacity-75 mt-1">Minimum withdrawal: ₹500</p>
            </div>
          </div>
          <div className="flex gap-3">
            {/* <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
              <FaBank />
              Withdraw to Bank
            </button> */}
            <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
              <FaCreditCard />
              Withdraw to UPI
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTransaction(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaRupeeSign className="text-3xl text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">₹{selectedTransaction.amount}</p>
                <p className="text-sm text-gray-500 mt-1">Delivery Payment</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-sm">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-sm">{selectedTransaction.orderId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Restaurant</span>
                  <span className="font-medium">{selectedTransaction.restaurant}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Customer</span>
                  <span>{selectedTransaction.customer}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Distance</span>
                  <span>{selectedTransaction.distance} km</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Delivery Time</span>
                  <span>{selectedTransaction.time} minutes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Date & Time</span>
                  <span>{new Date(selectedTransaction.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DeliveryLayout>
  );
};

export default DeliveryEarnings;