// Checkout.jsx
import { useEffect, useState } from "react";
import { createPaymentOrder } from "../../features/payment/paymentAPI";
import { createOrder } from "../../features/orders/orderAPI";
import { getCartAPI } from "../../features/cart/cartAPI";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaRupeeSign,
  FaTruck,
  FaClock,
  FaMapMarkerAlt,
  FaCreditCard,
  FaShoppingBag,
  FaWallet,
  FaShieldAlt,
} from "react-icons/fa";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      const stored = localStorage.getItem("addresses");
      try {
        const { data } = await getCartAPI();
        setCart(data);
        if (stored) {
          setSavedAddresses(JSON.parse(stored));
        }
      } catch (err) {
        console.log(err.response?.data);
      }
    };

    fetchCart();
  }, []);

  const handlePayment = async () => {
    if (loading) return;
    if (!address.street) {
      toast.error("Please select address");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Create DB Order
      const { data: order } = await createOrder({ address });
      console.log("Order created:", order);

      // 2️⃣ Create Razorpay Order
      const { data } = await createPaymentOrder(order._id);

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Eatify",
        description: "Food Delivery Order",
        image: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
        prefill: {
          name: order.user?.name || "Customer",
          email: order.user?.email || "customer@example.com",
        },
        handler: function (response) {
          console.log("Payment success:", response);
          // Save order ID
          localStorage.setItem("orderId", order._id);
          // Redirect immediately
          navigate("/track");
          setLoading(false);
        },
        modal:{
          ondismiss:function() {
            setLoading(false);
          },
        },
        theme: {
          color: "#f97316",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log(err.response?.data);
      setLoading(false);
    }
  };

  const handleSaveAddress = () => {
    if (!address.street || !address.city || !address.phone) {
      alert("Please fill all fields");
      return;
    }

    const updated = [...savedAddresses, address];

    setSavedAddresses(updated);
    setAddress(address);
    localStorage.setItem("addresses", JSON.stringify(updated));

    setShowForm(false);
    setAddress({ street: "", city: "", zipCode: "", phone: "" });
  };

  if (!cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items?.length === 0) {
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
              Add some delicious items to proceed with checkout
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
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Checkout
          </h1>
          <p className="text-gray-500 mt-1">
            Complete your order and enjoy delicious food
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Section - Order Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Delivery Address
                </h2>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-3">
                  {savedAddresses.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      No saved addresses. Add one to continue.
                    </p>
                  )}
                  {savedAddresses.map((addr, index) => (
                    <div
                      key={index}
                      className={`border p-3 rounded-lg cursor-pointer ${
                        address.street === addr.street
                          ? "border-red-500 bg-red-50"
                          : ""
                      }`}
                      onClick={() => setAddress(addr)}
                    >
                      <p className="font-medium">{addr.street}</p>
                      <p className="text-sm text-gray-500">
                        {addr.city}, {addr.zipCode}
                      </p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowForm(true)}
                    className="text-red-500 font-medium"
                  >
                    + Add New Address
                  </button>
                </div>
                {showForm && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Street"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={address.zipCode}
                      onChange={(e) =>
                        setAddress({ ...address, zipCode: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={address.phone}
                      onChange={(e) =>
                        setAddress({ ...address, phone: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />

                    <button
                      onClick={handleSaveAddress}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaShoppingBag className="text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Order Items</h2>
              </div>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item.menuItem.name || "item"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ₹{item.menuItem.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCreditCard className="text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Payment Method
                </h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-red-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Razorpay</p>
                    <p className="text-xs text-gray-500">
                      Credit/Debit Card, UPI, Net Banking
                    </p>
                  </div>
                  <img
                    src="https://cdn.razorpay.com/static/assets/logo/logo.svg"
                    alt="Razorpay"
                    className="h-6"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
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
                  <div className="flex justify-between font-bold text-gray-800 text-xl">
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

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="text-orange-500 text-sm" />
                  <span className="text-sm font-medium text-gray-700">
                    Estimated Delivery Time
                  </span>
                </div>
                <p className="text-gray-600 text-sm">25-35 minutes</p>
                <div className="flex items-center gap-2 mt-3">
                  <FaShieldAlt className="text-green-500 text-sm" />
                  <span className="text-xs text-gray-500">
                    Secure payment protected by Razorpay
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 mt-6 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaWallet />
                    Pay ₹{Math.round(grandTotal)}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                By placing your order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
