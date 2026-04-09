// Home.jsx (keeping your actual restaurant data display)
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaFire,
  FaClock,
  FaUtensils,
  FaArrowRight,
} from "react-icons/fa";
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import { useEffect, useState } from "react";
import { getRestaurants } from "../../features/menu/menuAPI";
import { useNavigate } from "react-router-dom";
import RestaurantList from "../../components/restaurant/RestaurantList";

const Home = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filters, setFilters] = useState({
    cuisine: "",
    rating: "",
    price: "",
  });
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await getRestaurants();
        //console.log("🔥 FULL API RESPONSE:", res);

        const restaurantsData = Array.isArray(res.data)
          ? res.data
          : res.data?.restaurants || res.data?.data || [];

        //console.log("✅ FINAL RESTAURANTS:", restaurantsData);

        setRestaurants(restaurantsData);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Carousel images
  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop",
      title: "Delicious Burgers",
      subtitle: "Juicy, fresh, and delivered hot",
    },
    {
      url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=400&fit=crop",
      title: "Healthy Salads",
      subtitle: "Fresh ingredients, healthy choices",
    },
    {
      url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop",
      title: "Pizza Perfection",
      subtitle: "Cheesy, crispy, and irresistible",
    },
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length,
    );
  };

  const handleBrowseClick = () => {
    navigate(`/browse?search=${searchTerm}`);
  };

  const scrollToRestaurants = () => {
    document
      .getElementById("restaurants-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  const search = searchTerm.trim().toLowerCase();

  // Filter restaurants based on search
  useEffect(() => {
    let filtered = [...restaurants];

    // 📍 LOCATION FILTER
    if (location) {
      filtered = filtered.filter(
        (r) => r.address?.city?.toLowerCase() === location.toLowerCase(),
      );
    }

    if (search) {
      filtered = filtered.filter((restaurant) => {
        const name = restaurant.restaurantName?.toLowerCase() || "";

        const cuisines = restaurant.cuisineType?.join(" ").toLowerCase() || "";

        const menuItems =
          restaurant.menu?.map((i) => i.name.toLowerCase()).join(" ") || "";

        return (
          name.includes(search) ||
          cuisines.includes(search) ||
          menuItems.includes(search)
        );
      });
    }

    // 🍽 CUISINE FILTER
    if (filters.cuisine) {
      filtered = filtered.filter((r) =>
        r.cuisineType?.includes(filters.cuisine),
      );
    }

    // ⭐ RATING FILTER
    if (filters.rating) {
      filtered = filtered.filter(
        (r) => (r.rating || 0) >= Number(filters.rating),
      );
    }

    // 💰 PRICE FILTER
    if (filters.price) {
      filtered = filtered.filter((r) => {
        const price = Number(r.avgPrice || 0);
        if (filters.price === "low") return price < 300;
        if (filters.price === "medium") return price < 600;
        return price >= 600;
      });
    }

    // 🔥 SORTING
    if (sortBy) {
      const sorted = [...filtered];

      if (sortBy === "rating") {
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      if (sortBy === "low") {
        sorted.sort((a, b) => (a.avgPrice || 0) - (b.avgPrice || 0));
      }

      if (sortBy === "high") {
        sorted.sort((a, b) => (b.avgPrice || 0) - (a.avgPrice || 0));
      }

      filtered = sorted;
    }

    setFilteredRestaurants(filtered);
  }, [search, restaurants, filters, sortBy, location]);

  const finalRestaurants =
    filteredRestaurants.length > 0 ? filteredRestaurants : restaurants;

  return (
    <div className="space-y-12 pb-12">
      {/* CAROUSEL SECTION */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <div className="relative h-64 md:h-96">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  {image.title}
                </h2>
                <p className="text-sm md:text-lg">{image.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* {!loading && finalRestaurants.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No restaurants found
        </div>
      )} */}

      {/* SEARCH & LOCATION BAR */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center border border-gray-200 rounded-full px-5 py-3 focus-within:border-red-400 transition-colors">
            <FaMapMarkerAlt className="text-red-400 mr-3" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="outline-none bg-transparent flex-1 text-gray-700"
            >
              <option value="Select">Select</option>
              <option value="Udaipur">Udaipur</option>
              <option value="Banglore">Banglore</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>

          <div className="flex-[2] flex items-center border border-gray-200 rounded-full px-5 py-3 focus-within:border-red-400 transition-colors">
            <FaSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for restaurants or dishes..."
              className="outline-none w-full text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={handleBrowseClick}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Search
          </button>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FaFire className="text-red-500 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Fast Delivery
          </h3>
          <p className="text-gray-500 text-sm">
            Get your food delivered within 30 minutes
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <FaStar className="text-orange-500 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Top Rated
          </h3>
          <p className="text-gray-500 text-sm">
            Only the best restaurants with 4.5+ ratings
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaClock className="text-green-500 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            24/7 Service
          </h3>
          <p className="text-gray-500 text-sm">Order anytime, day or night</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {/* Cuisine */}
        <select
          onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All Cuisines</option>
          <option value="Indian">Indian</option>
          <option value="Fast Food">Fast Food</option>
          <option value="Italian">Italian</option>
        </select>

        {/* Rating */}
        <select
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>

        {/* Price */}
        <select
          onChange={(e) => setFilters({ ...filters, price: e.target.value })}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Price</option>
          <option value="low">Under ₹300</option>
          <option value="medium">₹300-600</option>
          <option value="high">₹600+</option>
        </select>

        {/* Sort */}
        <select
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Sort</option>
          <option value="rating">Top Rated</option>
          <option value="low">Price Low → High</option>
          <option value="high">Price High → Low</option>
        </select>
      </div>

      

      {!loading && filteredRestaurants.length === 0 && (
        <p className="text-center text-gray-500">No restaurants found</p>
      )}

      {/* RESTAURANTS SECTION - DIRECT DISPLAY OF YOUR ACTUAL RESTAURANTS */}
      <div id="restaurants-section">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Restaurants near you
            </h2>
            <p className="text-gray-500 mt-1">
              {finalRestaurants.length}{" "}
              {finalRestaurants.length === 1 ? "restaurant" : "restaurants"}{" "}
              available
            </p>
          </div>
          <button
            onClick={scrollToRestaurants}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold group"
          >
            Browse All{" "}
            <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RestaurantList restaurants={finalRestaurants} loading={loading} />
        )}
      </div>

      {/* CTA SECTION */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Are you a restaurant owner?
        </h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Join Eatify and reach thousands of hungry customers in your area
        </p>
        <button className="bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-lg text-white px-8 py-3 rounded-full font-semibold transition-all"
        onClick={() => navigate("/Register")}
        >
          Partner with Us
        </button>
      </div>
    </div>
  );
};

export default Home;
