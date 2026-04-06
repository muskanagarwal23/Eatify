// RestaurantCard.jsx
import { FaStar, FaMapMarkerAlt, FaClock, FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const id = restaurant._id || restaurant.id;

  return (
    <div
      onClick={() => navigate(`/restaurant/${id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            restaurant.image?.img_url || 
            restaurant.imageUrl || 
            restaurant.image ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
          }
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {restaurant.isOpen && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Open Now
          </span>
        )}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
          <FaStar className="text-yellow-400 text-xs" />
          <span>{restaurant.rating || "4.5"}</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
          <FaRupeeSign className="text-xs" />
          <span> {restaurant.avgPrice} for two</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-red-500 transition-colors">
          {restaurant.name || restaurant.userId?.name}
        </h3>

        <p className="text-gray-500 text-sm mb-2 line-clamp-1">
          {restaurant.cuisineType?.join(", ") || "Various Cuisines"}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-red-400" />
            <span>
              {restaurant.address?.city || restaurant.location || "Near you"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="text-green-500" />
            <span>{restaurant.deliveryTime || "25-35"} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;