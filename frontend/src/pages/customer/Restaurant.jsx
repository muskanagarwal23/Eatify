import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMenu } from "../../features/menu/menuAPI";
import MenuItemCard from "../../features/menu/MenuItemCard";
//import { useDispatch } from "react-redux";
// import { addToCart } from "../../features/cart/cartSlice";
// import { addToCartAPI } from "../../features/cart/cartAPI";

const Restaurant = () => {
  const { id } = useParams();
  console.log(id);
  const [menu, setMenu] = useState([]);
  //const dispatch = useDispatch();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await getMenu(id);
        setMenu(data);
      } catch (err) {
        console.log(err.response?.data);
      }
    };

    fetchMenu();
  }, [id]);

  
  return (
    <div className="space-y-4">
      {menu.length === 0 ? (
        <p>No items found</p>
      ) : (
        menu.map((item) => (
          <MenuItemCard key={item._id} item={item} />
        ))
      )}
    </div>
  );
};

export default Restaurant;