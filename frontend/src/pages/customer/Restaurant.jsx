// Restaurant.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMenu, getRestaurantById } from "../../features/menu/menuAPI";
import MenuItemCard from "../../features/menu/MenuItemCard";
import {
  FaArrowLeft,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaUtensils,
  FaShoppingCart,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { getPublicReviews } from "../../features/review/reviewAPI";

const Restaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart?.items || []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔥 1. FETCH MENU
        const menuRes = await getMenu(id);
        console.log("🔥 MENU RESPONSE:", menuRes.data);

        const menuItems =
          menuRes.data.items || menuRes.data.data || menuRes.data;

        setMenu(menuItems);

        // 🔥 2. FETCH RESTAURANT DATA
        const restRes = await getRestaurantById(id);
        console.log("🔥 RESTAURANT RESPONSE:", restRes.data);

        const restaurant = restRes.data;

        setRestaurantInfo({
          name: restaurant.restaurantName,
          rating: restaurant.rating || 4.5,
          deliveryTime: "25-35",

          cuisine:
            restaurant.cuisineType?.length > 0
              ? restaurant.cuisineType.join(", ")
              : "Multi-cuisine",

          isOpen: restaurant.isOpen,

          location:
            restaurant.address?.city || restaurant.address?.area || "Near you",

          address: restaurant.address,

          image:
            restaurant.image?.url ||
            restaurant.image?.img_url ||
            restaurant.imageUrl ||
            restaurant.logo ||
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        });
      } catch (err) {
        console.log(err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
      const fetchReviews = async () => {
        try {
          const res = await getPublicReviews(id);
          setReviews(res.data || []);
        } catch (err) {
          console.log("Review fetch error", err);
        }
      };
      fetchReviews();
    },
    [id],
  );

  // Get unique categories from menu items
  const categories = [
    "all",
    ...new Set(menu.map((item) => item.category).filter(Boolean)),
  ];

  // Filter menu items by category
  const filteredMenu =
    selectedCategory === "all"
      ? menu
      : menu.filter((item) => item.category === selectedCategory);

  // Group menu items by category for better display
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const cartItemCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  return (
    <div className="space-y-6 pb-24">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
      >
        <FaArrowLeft className="text-sm" />
        <span>Back</span>
      </button>

      {/* RESTAURANT HEADER */}
      <div className="relative bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl overflow-hidden shadow-lg">
        {/* Restaurant Cover Image */}
        {restaurantInfo?.image && (
          <div className="absolute inset-0">
            <img
              src={restaurantInfo.image}
              alt={restaurantInfo.name}
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        <div className="relative px-6 md:px-8 py-8 md:py-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-4xl font-bold mb-3">
              {restaurantInfo?.name || "Loading..."}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div
                className="flex items-center gap-1"
                onClick={() => navigate(`/reviews/${id}`)}
              >
                <div
                  onClick={() => navigate(`/reviews/${id}`)}
                  className="flex items-center gap-2 cursor-pointer hover:underline"
                >
                  <FaStar className="text-yellow-300" />
                  <span className="font-semibold">
                    {restaurantInfo?.rating || 0} ★
                  </span>
                  <span className="text-sm text-white/80">
                    ({reviews.length} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <FaClock className="text-green-300" />
                <span>{restaurantInfo?.deliveryTime || "25-35"} min</span>
              </div>
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-red-300" />
                <span>
                  {restaurantInfo?.location || "Location not specified"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FaUtensils className="text-orange-300" />
                <span>{restaurantInfo?.cuisine || "Multi-cuisine"}</span>
              </div>
            </div>
            {restaurantInfo?.address && (
              <p className="text-sm text-white/80 mt-2">
                {restaurantInfo.address.street &&
                  `${restaurantInfo.address.street}, `}
                {restaurantInfo.address.city && restaurantInfo.address.city}
                {restaurantInfo.address.zipCode &&
                  ` - ${restaurantInfo.address.zipCode}`}
              </p>
            )}
            {restaurantInfo?.isOpen ? (
              <span className="inline-block mt-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                Open Now
              </span>
            ) : (
              <span className="inline-block mt-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                Closed
              </span>
            )}
          </div>
        </div>
      </div>
      {/* ⭐ REVIEWS PREVIEW */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Customer Reviews
            </h2>

            <button
              onClick={() => navigate(`/reviews/${id}`)}
              className="text-red-500 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          <div className="space-y-4">
            {reviews.slice(0, 2).map((r) => (
              <div key={r._id} className="border-b pb-3 last:border-none">
                <p className="font-medium text-gray-800">
                  {r.customerId?.name || "User"}
                </p>

                <div className="flex gap-1 my-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < r.rating?.value
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>

                <p className="text-gray-600 text-sm">{r.rating?.review}</p>

                {/* Vendor reply */}
                {r.reply && (
                  <div className="mt-2 bg-green-50 p-2 rounded text-sm">
                    <span className="font-medium text-green-700">Vendor:</span>{" "}
                    {r.reply}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MENU SECTION */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Our Menu</h2>
              <p className="text-gray-500 text-sm mt-1">
                {menu.length} {menu.length === 1 ? "item" : "items"} available
              </p>
            </div>

            {/* CATEGORY FILTER */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category === "all" ? "All Items" : category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MENU ITEMS LIST */}
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : menu.length === 0 ? (
          <div className="text-center py-16">
            <FaUtensils className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No menu items available</p>
            <p className="text-gray-400 text-sm mt-2">
              Check back later for delicious items!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="p-6">
                {selectedCategory === "all" && (
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {category}
                  </h3>
                )}
                <div className="space-y-4">
                  {items.map((item) => (
                    <MenuItemCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CART BUTTON - FLOATING ACTION BUTTON */}
      {token && cartItemCount > 0 && (
        <button
          onClick={() => navigate("/cart")}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
        >
          <FaShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {cartItemCount}
          </span>
        </button>
      )}
    </div>
  );
};

export default Restaurant;
