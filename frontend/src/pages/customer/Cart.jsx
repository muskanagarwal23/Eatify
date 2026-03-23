import { useSelector } from "react-redux";

const Cart = () => {
  const { items } = useSelector((state) => state.cart);

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      
      <h1 className="text-xl font-bold mb-4">Your Cart</h1>

      {items.map((item) => (
        <div key={item._id} className="flex justify-between mb-3">
          <span>{item.name} x {item.quantity}</span>
          <span>₹{item.price * item.quantity}</span>
        </div>
      ))}

      

      <div className="flex justify-between mt-6 font-bold">
        <span>Total</span>
        <span>₹{total}</span>
      </div>
    </div>
  );
};

export default Cart;