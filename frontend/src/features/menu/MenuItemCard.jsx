import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../cart/cartSlice";
import { addToCartAPI, updateCartAPI } from "../cart/cartAPI";
import { FaPlus, FaRupeeSign, FaStar, FaCheck } from "react-icons/fa";

const MenuItemCard = ({ item }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleAdd = async () => {
    if (isAdding) return;

    setIsAdding(true);

    // UI update
    dispatch(addToCart(item));

    // Backend sync
    try {
      await addToCartAPI({
        menuItemId: item._id,
        quantity: 1,
      });

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.log(err.response?.data);
    } finally {
      setIsAdding(false);
    }
  };
  
  const cartItems = useSelector((state) => state.cart.items);
  console.log("cartItems",cartItems);
  
  const cartItem = cartItems.find(
  (i) => i._id === item._id
);
  
  const quantity = cartItem ? cartItem.quantity : 0;
  const handleIncrease = async () => {
    dispatch(addToCart(item));

    try {
      await addToCartAPI({
        menuItemId: item._id,
        quantity: 1,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDecrease = async () => {
    dispatch(removeFromCart(item._id)); // make sure you have this

    try {
      await updateCartAPI({
        menuItemId: item._id,
        quantity: -1,
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Get the correct image URL from different possible fields
  const getImageUrl = () => {
    if (item.image?.img_url) return item.image.img_url;
    if (item.imageUrl) return item.imageUrl;
    if (item.image?.url) return item.image.url;
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop";
  };

  return (
    <div
      className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group border border-gray-100 hover:border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE SECTION */}
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={getImageUrl()}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop";
          }}
        />
      </div>

      {/* DETAILS SECTION */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-base md:text-lg group-hover:text-red-500 transition-colors">
              {item.name}
            </h3>
            {item.category && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1 inline-block">
                {item.category}
              </span>
            )}
          </div>
          {item.isAvailable === false && (
            <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
              Unavailable
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <FaRupeeSign className="text-gray-600 text-sm" />
            <span className="font-bold text-gray-800 text-lg">
              {item.price}
            </span>
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-3 py-1 shadow-sm">
              <button
                onClick={handleDecrease}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-500 hover:text-white"
              >
                -
              </button>

              <span className="font-semibold text-gray-800">{quantity}</span>

              <button
                onClick={handleIncrease}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-green-500 hover:text-white"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={item.isAvailable === false || isAdding}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                item.isAvailable === false
                  ? "bg-gray-200 text-gray-400"
                  : "bg-gray-100 hover:bg-red-500 hover:text-white"
              }`}
            >
              <FaPlus className="text-xs" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
