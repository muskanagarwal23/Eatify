import {connectSocket, getSocket} from "../../sockets/socket";
import { useEffect, useState } from "react";
import {
  getCartAPI,
  updateCartAPI,
  removeFromCartAPI,
} from "../../features/cart/cartAPI";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaRupeeSign,
  FaCreditCard,
  FaTruck,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import {
  updateCart,
  removeFromCart,
  setCart,
} from "../../features/cart/cartSlice";
import toast from "react-hot-toast";

const Cart = () => {
  const [cart, setLocalCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
  const userId = localStorage.getItem("userId");
  let socket = getSocket();
  if(!socket) {
    socket = connectSocket();
  }
  // 🔹 1. Load from localStorage (instant UI)
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    const parsed = JSON.parse(savedCart);

    setLocalCart(parsed);
    dispatch(setCart(parsed.items));
  }

  // 🔹 2. Connect socket for real-time updates
  if (userId && socket) {
    socket.emit("joinCart", userId);
  }
   
  if(socket){
  socket.on("cartUpdated", (updatedCart) => {
    setLocalCart((prev) => ({
      ...updatedCart,
      items: updatedCart.items.map((item, index) => ({
        ...item,
        menuItem: item.menuItem || prev.items[index]?.menuItem,
      })),
    }));

    dispatch(setCart(updatedCart.items));

    // 🔥 sync localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  });
};

  // 🔹 3. Fetch latest cart from backend
  const fetchCart = async () => {
    try {
      setLoading(true);

      const { data } = await getCartAPI();
      console.log("CART response:", data);

      setLocalCart((prev) => ({
        ...data,
        items: data.items.map((item, index) => ({
          ...item,
          menuItem: item.menuItem || prev.items[index]?.menuItem,
        })),
      }));

      dispatch(setCart(data.items));
      toast.success("Added to cart");

      // 🔥 overwrite localStorage with backend truth
      localStorage.setItem("cart", JSON.stringify(data));

    } catch (err) {
      console.log("❌ ERROR:", err);
      toast.error("item is not addded to cart");
      
    } finally {
      setLoading(false);
    }
  };

  fetchCart();

  // 🔹 4. Cleanup socket
  return () => {
    socket.off("cartUpdated");
  };
}, []);

  const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 1) return;

  // 🔥 Save previous state (for rollback)
  const prevCart = cart;

  // ⚡ Optimistic UI update
  setLocalCart((prev) => ({
    ...prev,
    items: prev.items.map((item) =>
      item._id === itemId
        ? { ...item, quantity: newQuantity }
        : item
    ),
  }));

  try {
    const { data } = await updateCartAPI({
      itemId,
      quantity: newQuantity,
    });

    // ✅ Sync with backend (correct data)
    setLocalCart(data);
    dispatch(setCart(data.items));
     toast.success("Cart updated ✅");
  } catch (err) {
    console.log(err.response?.data);

    // ❌ Rollback if API fails
    setLocalCart(prevCart);
  }
};

  const removeItem = async (itemId) => {
    if (updating) return;

    setUpdating(true);
    try {
      const { data } = await removeFromCartAPI(itemId);
      setLocalCart((prev) => ({
        ...data,
        items: prev.items.filter((item) => item._id !== itemId)
      }));
      dispatch(removeFromCart(itemId));
       toast.success("Item removed 🗑️");
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart?.items?.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any items to your cart yet
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deliveryFee = cart.deliveryFee || 40;
  const tax = cart.tax || cart.totalAmount * 0.05;
  const grandTotal = cart.totalAmount + deliveryFee + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
          >
            <FaArrowLeft className="text-sm" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Your Cart
          </h1>
          <p className="text-gray-500 mt-1">
            {cart?.items?.length} {cart?.items?.length === 1 ? "item" : "items"}{" "}
            in your cart
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="md:col-span-2 space-y-4">
            {cart?.items?.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all"
              >
                <div className="flex gap-4">
                  {/* Item Image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={
                        item.menuItem.image?.img_url ||
                        item.menuItem.imageUrl ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"
                      }
                      alt={item.menuItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {item.menuItem?.name || "item"}
                        </h3>
                        {item.menuItem.category && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1 inline-block">
                            {item.menuItem.category}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        disabled={updating}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-gray-600 font-semibold mt-2">
                      ₹{item.menuItem.price || 0}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={updating || item.quantity <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaMinus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="font-medium text-gray-700 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        disabled={updating}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <FaPlus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="ml-auto font-bold text-gray-800">
                        ₹{item.menuItem.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cart.totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <FaTruck className="text-sm" />
                    Delivery Fee
                  </span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>₹{Math.round(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-gray-800 text-lg">
                    <span>Total</span>
                    <span className="flex items-center gap-1">
                      <FaRupeeSign className="text-sm" />
                      {Math.round(grandTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Inclusive of all taxes
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                disabled={updating}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 mt-6 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaCreditCard />
                Proceed to Checkout
              </button>

              <div className="mt-4 text-center">
                <Link
                  to="/browse"
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Add more items
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
