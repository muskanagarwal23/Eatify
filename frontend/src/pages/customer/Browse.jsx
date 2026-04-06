// Browse.jsx (FINAL FIXED)

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RestaurantList from "../../components/restaurant/RestaurantList";
import { getRestaurants } from "../../features/menu/menuAPI";
import { FaSearch } from "react-icons/fa";

const Browse = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    cuisine: "",
    rating: "",
    price: "",
  });
  const [sortBy, setSortBy] = useState("");

  const search = (searchParams.get("search") || "")
    .trim()
    .toLowerCase();

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRestaurants();

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.restaurants || res.data?.data || [];

        console.log("Browse data:", data);

        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // SEARCH LOGIC (FIXED)
  useEffect(() => {
    let filtered = [...restaurants];

    if (search) {
      filtered = filtered.filter((restaurant) => {
        const name =
          restaurant.restaurantName?.toLowerCase() || "";

        const cuisines =
          restaurant.cuisineType?.join(" ").toLowerCase() || "";

        // ✅ CORRECT FIELD
        const menuItems =
          restaurant.menu
            ?.map((i) => i.name.toLowerCase())
            .join(" ") || "";

        return (
          name.includes(search) ||
          cuisines.includes(search) ||
          menuItems.includes(search)
        );
      });
    }

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
  }, [search, restaurants, filters,sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6">
          Browse Restaurants
        </h1>

        {/* SEARCH */}
        <div className="flex mb-6">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow w-full">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              value={searchParams.get("search") || ""}
              onChange={(e) =>
                setSearchParams({ search: e.target.value })
              }
              placeholder="Search pizza, burger..."
              className="w-full outline-none"
            />
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

        {/* RESULT COUNT */}
        <p className="text-gray-500 mb-4">
          {filteredRestaurants.length} restaurants found
        </p>

        

        {/* LIST */}
        <RestaurantList
          restaurants={filteredRestaurants}
          loading={loading}
        />

      </div>
    </div>
  );
};

export default Browse;