import { useState } from "react";
import { registerUser } from "../../features/auth/authAPI";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER"
  });

  const handleRegister = async () => {
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      
      <div className="bg-white p-8 rounded-xl shadow w-96">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 border rounded mb-3"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

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
          onClick={handleRegister}
          className="w-full bg-orange-500 text-white py-3 rounded-lg"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;