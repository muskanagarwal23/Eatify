import { Link,useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-orange-500 cursor-pointer"
        >
          Eatify
        </h1>

        {/* Links */}
        <div className="flex gap-8 text-gray-600 font-medium">
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
        </div>

        {/* Auth */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;