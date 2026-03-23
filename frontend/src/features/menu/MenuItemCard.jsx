import { useDispatch } from "react-redux";
import { addToCart } from "../cart/cartSlice";
import { addToCartAPI } from "../cart/cartAPI";

const MenuItemCard = ({ item}) => {
  const dispatch = useDispatch();
    const handleAdd = async () => {
    // UI update
    dispatch(addToCart(item));

    // Backend sync
    try {
      await addToCartAPI({
        menuItemId: item._id,
        quantity: 1,
      });
    } catch (err) {
      console.log(err.response?.data);
    }
  };
     return (
    <div className="flex justify-between bg-white p-4 rounded-lg shadow">
      <div>
        <h2>{item.name}</h2>
        <p>₹{item.price}</p>
      </div>

      <button
        onClick={handleAdd}
        className="bg-orange-500 text-white px-3 py-1 rounded"
      >
        Add
      </button>
    </div>
  );
};

export default MenuItemCard;