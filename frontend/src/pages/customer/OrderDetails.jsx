import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyOrders } from "../../features/orders/orderAPI";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await getMyOrders();
        const found = data.find((o) => o._id === id);

        if (!found) {
          setOrder(null);
        } else {
          setOrder(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Loading order details...
      </div>
    );
  }

  // ❌ NOT FOUND
  if (!order) {
    return (
      <div className="text-center mt-20 text-red-500">
        Order not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* 🔙 BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-red-500"
        >
          <FaArrowLeft /> Back
        </button>

        {/* 🧾 CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Order #{order._id.slice(-6)}
            </h2>

            <span className="text-green-500 font-semibold flex items-center gap-1">
              <FaCheckCircle /> {order.status}
            </span>
          </div>

          {/* 🏪 RESTAURANT */}
          <p className="text-lg font-semibold">
            {order.vendorId?.name || "Restaurant"}
          </p>

          {/* 📅 DATE */}
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>

          {/* 📍 ADDRESS */}
          {order.address && (
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Delivery Address</p>
              <p>
                {order.address.street}, {order.address.city}
              </p>
            </div>
          )}

          {/* 🍽 ITEMS */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-3">Items</h3>

            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center mb-3"
              >
                <div>
                  <p className="font-medium">
                    {item.name} × {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    ₹{item.price} each
                  </p>
                </div>

                <p className="font-medium">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          {/* 💰 BILL */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          {/* 💳 PAYMENT */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Payment</h3>
            <p>Status: {order.payment?.status}</p>
          </div>

          {/* 🚴 DELIVERY */}
          {order.deliveryPartnerId && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Delivery Partner</h3>
              <p>{order.deliveryPartnerId.name}</p>
              <p className="text-sm text-gray-500">
                {order.deliveryPartnerId.phone}
              </p>
            </div>
          )}

          {/* 📜 TIMELINE */}
          {order.timeline?.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-3">Order Timeline</h3>

              {order.timeline.map((t, idx) => (
                <div key={idx} className="mb-2 text-sm text-gray-600">
                  • {t.status} —{" "}
                  {new Date(t.timestamp).toLocaleTimeString()}
                </div>
              ))}
            </div>
          )}

          {/* ⭐ RATING */}
          {order.rating?.value && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Your Rating</h3>
              <p>⭐ {order.rating.value}</p>
              <p className="text-gray-500">{order.rating.review}</p>
            </div>
          )}

          {/* 🔥 ACTIONS */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                localStorage.setItem("orderId", order._id);
                navigate("/track");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Track Order
            </button>

            <button
              onClick={() => navigate("/browse")}
              className="px-4 py-2 border rounded-lg"
            >
              Order Again
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;