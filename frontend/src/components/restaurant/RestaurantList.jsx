// RestaurantList.jsx
import RestaurantCard from "./RestaurantCard";
import { FaUtensils, FaSearch } from "react-icons/fa";

const RestaurantList = ({ restaurants, loading }) => {
  console.log("LIST DATA:", restaurants);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
          <div key={n} className="bg-white rounded-xl shadow-md animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-md">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaUtensils className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No restaurants found</h3>
        <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
        >
          <FaSearch />
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant._id || restaurant.id}
          restaurant={restaurant}
        />
      ))}
    </div>
  );
};

export default RestaurantList;