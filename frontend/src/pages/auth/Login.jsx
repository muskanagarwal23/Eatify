import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../features/auth/authSlice";
import { loginUser } from "../../features/auth/authAPI";
import { useNavigate } from "react-router-dom";

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

       dispatch(
      loginSuccess({
        user: { role: data.role }, // create user object
        token: data.token,
      })
    );

      navigate("/");
    } catch (err) {
         console.log(err.response?.data);
      dispatch(loginFailure());

    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      
      <div className="bg-white p-8 rounded-xl shadow w-96">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-3"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-orange-500 text-white py-3 rounded-lg"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;