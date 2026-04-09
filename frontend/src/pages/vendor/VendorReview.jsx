// VendorReviews.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaUser,
  FaReply,
  FaThumbsUp,
  FaThumbsDown,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaSmile,
  FaMeh,
  FaPaperPlane,
  FaFrown,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
  FaQuoteLeft,
  FaRegClock,
} from "react-icons/fa";
import toast from "react-hot-toast";
import {
  getVendorReviews,
  replyToReviews,
} from "../../features/review/reviewAPI";
import VendorLayout from "../../components/vendor/VendorLayout";

const VendorReview = () => {
  const { token } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getVendorReviews();

      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSubmitting(true);
    try {
      const res = await replyToReviews(reviewId, { reply: replyText });

      toast.success("Reply posted successfully");
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? { ...r, reply: replyText, repliedAt: new Date() }
            : r,
        ),
      );
      setSelectedReview(null);
      setReplyText("");
      console.log("reply response:", res.data);
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
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
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <FaSmile className="text-green-500" />;
    if (rating >= 2.5) return <FaMeh className="text-yellow-500" />;
    return <FaFrown className="text-red-500" />;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "bg-green-100 text-green-700";
    if (rating >= 2.5) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  // Calculate statistics
  const stats = {
    total: reviews.length,
    averageRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating?.value || 0), 0) /
            reviews.length
          ).toFixed(1)
        : 0,
    withReplies: reviews.filter((r) => r.reply).length,
    withoutReplies: reviews.filter((r) => !r.reply && r.rating?.value).length,
    ratingDistribution: {
      5: reviews.filter((r) => (r.rating?.value || 0) === 5).length,
      4: reviews.filter((r) => (r.rating?.value || 0) === 4).length,
      3: reviews.filter((r) => (r.rating?.value || 0) === 3).length,
      2: reviews.filter((r) => (r.rating?.value || 0) === 2).length,
      1: reviews.filter((r) => (r.rating?.value || 0) === 1).length,
    },
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "WITH_REPLY"
          ? review.reply
          : filter === "WITHOUT_REPLY"
            ? !review.reply && review.rating?.value
            : true;

    const matchesSearch =
      review.customerId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.rating?.review?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.orderId?._id?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-32 bg-gray-200 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-24 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <VendorLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Reviews</h1>
          <p className="text-gray-500 mt-1">
            Read and respond to customer feedback
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:shadow-md transition-all"
        >
          <FaSpinner className={`text-sm ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaStar className="text-yellow-400 text-3xl opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.averageRating}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {renderStars(parseFloat(stats.averageRating))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Replied to</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.withReplies}
              </p>
            </div>
            <FaCheckCircle className="text-green-500 text-3xl opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Reply</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.withoutReplies}
              </p>
            </div>
            <FaRegClock className="text-yellow-500 text-3xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          Rating Distribution
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <div className="w-12 text-sm font-medium text-gray-600">
                {star} ★
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  style={{
                    width: `${(stats.ratingDistribution[star] / stats.total) * 100 || 0}%`,
                  }}
                ></div>
              </div>
              <div className="w-12 text-sm text-gray-500">
                {stats.ratingDistribution[star]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, review content, or order ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilter("ALL");
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-lg transition-all ${
              filter === "ALL"
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => {
              setFilter("WITH_REPLY");
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-lg transition-all ${
              filter === "WITH_REPLY"
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Replied
          </button>
          <button
            onClick={() => {
              setFilter("WITHOUT_REPLY");
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-lg transition-all ${
              filter === "WITHOUT_REPLY"
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Pending Reply
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {paginatedReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStar className="text-4xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-500">
            {searchTerm || filter !== "ALL"
              ? "Try adjusting your search or filters"
              : "You haven't received any reviews yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
              >
                {/* Review Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                      <FaUser className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {review.customerId?.name || "Anonymous Customer"}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FaClock className="text-xs" />
                        {new Date(review.createdAt).toLocaleDateString()} •
                        Order #{review.orderId?._id?.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getRatingColor(review.rating?.value)}`}
                  >
                    {getRatingIcon(review.rating?.value)}
                    <span className="font-medium">
                      {review.rating?.value}.0
                    </span>
                    <div className="flex gap-0.5">
                      {renderStars(review.rating?.value)}
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="ml-13 pl-0 md:pl-12">
                  <FaQuoteLeft className="text-gray-200 text-2xl mb-2" />
                  <p className="text-gray-600 italic mb-4">
                    "{review.rating?.review || "No review text provided"}"
                  </p>

                  {/* Vendor Reply */}
                  {review.reply ? (
                    <div className="mt-4 bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                        <FaReply className="text-xs" />
                        Your Reply
                      </p>
                      <p className="text-gray-600 text-sm">{review.reply}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Replied on{" "}
                        {new Date(review.repliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
                      >
                        <FaReply />
                        Reply to Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
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
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Reply to Review
              </h2>
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setReplyText("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Review */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {selectedReview.customerId?.name || "Anonymous"}
                    </p>
                    <div className="flex gap-0.5">
                      {renderStars(selectedReview.rating?.value)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic">
                  "{selectedReview.rating?.review}"
                </p>
              </div>

              {/* Reply Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response to this customer review..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Be professional and courteous in your response
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setReplyText("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitReply(selectedReview._id)}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Post Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </VendorLayout>
  );
};

export default VendorReview;
