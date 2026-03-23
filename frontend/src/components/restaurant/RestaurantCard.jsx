import { Link } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  return (
    
    <Link to={`/restaurant/${restaurant.userId?._id || restaurant.userId}`}>
     console.log(restaurant);
     
     
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 cursor-pointer">
        
        <img
          src={restaurant.image}
          className="h-40 w-full object-cover"
        />

        <div className="p-4">
          <h2 className="font-semibold text-lg">
            {restaurant.name}
          </h2>

          <p className="text-gray-500 text-sm">
            {restaurant.category}
          </p>

          <div className="flex justify-between mt-3 text-sm text-gray-600">
            <span>⭐ {restaurant.rating}</span>
            <span>{restaurant.deliveryTime} mins</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;