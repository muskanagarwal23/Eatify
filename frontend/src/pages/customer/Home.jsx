import { FaSearch } from "react-icons/fa";
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import { useEffect, useState } from "react";
import { getRestaurants } from "../../features/menu/menuAPI";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
   console.log(restaurants);
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getRestaurants();
      setRestaurants(data);
    };
    fetchData();
  }, []);

  return (
     <div className="text-center mt-10">

      <h1 className="text-4xl font-bold text-gray-800">
        Order Food <span className="text-orange-500">Fast & Fresh</span>
      </h1>

      <p className="text-gray-500 mt-3">
        Discover top restaurants near you
      </p>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Restaurants near you</h2>

          <div className="grid grid-cols-4 gap-6">
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        </div>

        {/* SEARCH BAR */}
         <div className="flex items-center bg-white shadow-md rounded-full px-4 py-3 mt-6 max-w-xl mx-auto">
        <FaSearch className="text-gray-400 mr-3" />

        <input
          type="text"
          placeholder="Search for restaurants or dishes..."
          className="outline-none w-full"
        />

        <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full">
          Search
        </button>
      </div>
    </div>
  );
};

export default Home;
