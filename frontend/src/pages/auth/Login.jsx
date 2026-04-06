// Login.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../features/auth/authSlice";
import { loginUser } from "../../features/auth/authAPI";
import { useNavigate, Link } from "react-router-dom";
import { connectSocket } from "../../sockets/socket";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      dispatch(loginStart());
      const { data } = await loginUser(form);
      toast.success("Login Successfully!");
      const user = data.user;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      connectSocket();

       dispatch(
        loginSuccess({
          user: data.user,
          token: data.token,
        }),
      );

      if (user.role === "VENDOR") {
        navigate("/vendor/dashboard");
      } else if (user.role === "CUSTOMER") {
        navigate("/");
      }
    } catch (err) {
      dispatch(loginFailure());
      toast.error("Your account is under review. We’ll notify you soon.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative flex items-center justify-center p-6">
      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* LEFT SECTION - FORM */}
            <div className="p-8 md:p-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Login</h1>
              <p className="text-gray-500 mb-8">
                More than{" "}
                <span className="text-red-500 font-semibold">
                  15,000 recipes
                </span>{" "}
                from around the world!
              </p>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-400"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                  LOGIN
                </button>

                <div className="pt-4">
                  <p className="text-center text-gray-500 text-sm mb-3">
                    Login with:
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                      Facebook
                    </button>
                    <button className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                      Google+
                    </button>
                    <button className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                      Twitter
                    </button>
                  </div>
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-red-500 font-semibold hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>

            {/* RIGHT SECTION - IMAGE */}
            <div className="hidden md:block relative bg-gradient-to-br from-red-400 to-red-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1000&fit=crop"
                className="w-full h-full object-cover mix-blend-overlay"
                alt=""
              />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-2xl font-bold mb-2">Welcome to Eatify</p>
                <p className="text-sm opacity-90">
                  Discover thousands of delicious recipes from around the world
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER LINKS */}
          <div className="border-t border-gray-200 py-4 px-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link
              to="/explore"
              className="hover:text-red-500 transition-colors"
            >
              Explore
            </Link>
            <span>What</span>
            <Link to="/help" className="hover:text-red-500 transition-colors">
              Help & feedback
            </Link>
            <Link
              to="/contact"
              className="hover:text-red-500 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
