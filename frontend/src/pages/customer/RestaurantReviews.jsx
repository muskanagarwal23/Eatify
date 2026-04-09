// RestaurantReviews.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaArrowLeft, 
  FaUser, 
  FaClock, 
  FaReply,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
  FaQuoteLeft,
  FaChartLine,
  FaSmile,
  FaMeh,
  FaFrown,
  FaThumbsUp
} from "react-icons/fa";
import toast from "react-hot-toast";
import { getPublicReviews, createReviews } from "../../features/review/reviewAPI";

const RestaurantReviews = () => {
  const { id } = useParams(); // vendorId
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const isLoggedIn = !!token;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({
    rating: 0,
    review: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await getPublicReviews(id);
      setReviews(res.data || []);
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.rating) {
      return toast.error("Please select a rating");
    }

    if (!isLoggedIn) {
      toast.error("Please login to submit a review");
      return;
    }

    setSubmitting(true);
    try {
      await createReviews({
        vendorId: id,
        rating: form.rating,
        review: form.review,
      });

      toast.success("Review submitted successfully!");
      setShowModal(false);
      setForm({ rating: 0, review: "" });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
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
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <FaSmile className="text-green-500" />;
    if (rating >= 2.5) return <FaMeh className="text-yellow-500" />;
    return <FaFrown className="text-red-500" />;
  };

  const getRatingText = (rating) => {
    if (rating >= 4) return "Excellent";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Average";
    return "Poor";
  };

  // Calculate statistics
  const stats = {
    total: reviews.length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating?.value || 0), 0) / reviews.length).toFixed(1)
      : 0,
    distribution: {
      5: reviews.filter(r => (r.rating?.value || 0) === 5).length,
      4: reviews.filter(r => (r.rating?.value || 0) === 4).length,
      3: reviews.filter(r => (r.rating?.value || 0) === 3).length,
      2: reviews.filter(r => (r.rating?.value || 0) === 2).length,
      1: reviews.filter(r => (r.rating?.value || 0) === 1).length
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-6"
        >
          <FaArrowLeft className="text-sm" />
          <span>Back to Restaurant</span>
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Customer Reviews</h1>
              <p className="text-gray-500 mt-1">What people are saying about this restaurant</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              <FaStar />
              Write a Review
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Rating Overview */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="text-5xl font-bold text-gray-800">{stats.averageRating}</span>
                  <div>
                    <div className="flex gap-1">
                      {renderStars(parseFloat(stats.averageRating))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  {getRatingIcon(parseFloat(stats.averageRating))}
                  <span className="font-medium text-gray-700">
                    {getRatingText(parseFloat(stats.averageRating))}
                  </span>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => {
                  const percentage = stats.total > 0 ? (stats.distribution[star] / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="w-12 text-sm text-gray-600">{star} ★</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-500">{stats.distribution[star]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStar className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share your experience!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div 
                key={review._id} 
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
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
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {renderStars(review.rating?.value)}
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                    {getRatingIcon(review.rating?.value)}
                    <span className="text-sm font-medium text-gray-700">
                      {getRatingText(review.rating?.value)}
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="ml-13 pl-0 md:pl-12">
                  <FaQuoteLeft className="text-gray-200 text-2xl mb-2" />
                  <p className="text-gray-600 leading-relaxed">
                    {review.rating?.review || "No review text provided"}
                  </p>

                  {/* Vendor Reply */}
                  {review.reply && (
                    <div className="mt-4 bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-center gap-2 mb-2">
                        <FaReply className="text-green-600 text-sm" />
                        <p className="text-sm font-semibold text-green-700">Restaurant Response</p>
                      </div>
                      <p className="text-gray-600 text-sm">{review.reply}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Replied on {new Date(review.repliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scaleIn">
              <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Write a Review</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setForm({ rating: 0, review: "" });
                    setHoverRating(0);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Rating Stars */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FaStar
                        key={star}
                        onClick={() => setForm({ ...form, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`cursor-pointer text-3xl transition-all ${
                          (hoverRating || form.rating) >= star 
                            ? "text-yellow-400 scale-110" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {form.rating > 0 && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <FaThumbsUp className="text-xs" />
                      You selected {form.rating} star{form.rating !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Share your experience with this restaurant..."
                    value={form.review}
                    onChange={(e) => setForm({ ...form, review: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your honest feedback helps others make better choices
                  </p>
                </div>

                {/* Login Warning */}
                {!isLoggedIn && (
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-sm text-yellow-700">
                      Please login to submit a review
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setForm({ rating: 0, review: "" });
                      setHoverRating(0);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.rating || !isLoggedIn}
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantReviews;