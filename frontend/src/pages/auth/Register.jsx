import { useState } from "react";
import { registerUser } from "../../features/auth/authAPI";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("CUSTOMER");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    licenseNumber: "",
    vehicleNumber: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const isImage = file?.type.startsWith("image/");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);

    const fileURL = URL.createObjectURL(selected);
    setPreview(fileURL);
  };

  const validate = () => {
    if (!form.name || !form.email || !form.password) {
      return "All basic fields are required";
    }

    if (role === "VENDOR"  ) {
      if (!form.licenseNumber) return "License Number required";
      if (!file) return "Documents required";
    }
    if (role === "DELIVERY"  ) {
      if (!form.licenseNumber) return "License Number required";
      if (!form.vehicleNumber) return "Vehicle Number required";
      if (!file) return "Documents required";
    }
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) return setError(err);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", role);

      if (role === "VENDOR") {
        formData.append("licenseNumber", form.licenseNumber);
        formData.append("document", file);
      }
      if (role === "DELIVERY") {
        formData.append("licenseNumber", form.licenseNumber);
        formData.append("vehicleNumber", form.vehicleNumber);
        formData.append("document", file);
      }

      await registerUser(formData);
      setIsRegistered(true);
      
    } catch (err) {
      console.log("Full error:", err);
      console.log("RESPONSE:", err.response);
      console.log("DATA:", err.response?.data);
      //setError(err.response?.data?.message || "Error");
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  if (isRegistered && role === "VENDOR" || isRegistered && role === "DELIVERY") {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md">
        
        <h1 className="text-2xl font-bold text-green-600 mb-4">
           Registration Successful
        </h1>

        <p className="text-gray-600 mb-4">
          Your {role.toLowerCase()} account has been created.
        </p>

        <p className="text-gray-500 text-sm mb-6">
          Our team will review your documents and get back to you shortly.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative flex items-center justify-center p-6">
      {/* REGISTER CARD */}
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Create Account
              </h1>
              <p className="text-gray-500 mb-8">
                Join us and start your culinary journey
              </p>
              <form
                onSubmit={handleRegister}
                className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4"
              >
                {/* ROLE */}
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all bg-white"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="DELIVERY">Delivery</option>
                </select>

                {/* NAME */}
                <input
                  name="name"
                  placeholder="Name"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                />

                {/* EMAIL */}
                <input
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                />

                {/* PASSWORD */}
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                />

                {/* VENDOR FIELDS */}
                {role === "VENDOR" && (
                  <>
                    <input
                      name="licenseNumber"
                      placeholder="License Number"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                    />

                    {/* FILE UPLOAD */}
                    <input
                      type="file"
                      onChange={handleFile}
                      className="w-full"
                    />

                    {/* PREVIEW */}
                    {file && (
                      <div className="border p-3 rounded bg-gray-50">
                        {/* File Name */}
                        <p className="text-sm text-gray-700 mb-2">
                          📄 {file.name}
                        </p>

                        {isImage && (
                          <img
                            src={preview}
                            alt="preview"
                            className="w-full h-40 object-cover rounded mb-2"
                          />
                        )}

                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() => window.open(preview, "_blank")}
                          className="text-blue-600 text-sm underline hover:text-blue-800"
                        >
                          Preview Document
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* DELIVERY FIELDS */}
                {role === "DELIVERY" && (
                  <>
                    <input
                      name="licenseNumber"
                      placeholder="License Number"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                    />
                    <input
                      name="vehicleNumber"
                      placeholder="Vehicle Number"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
                    />

                    {/* FILE UPLOAD */}
                    <input
                      type="file"
                      onChange={handleFile}
                      className="w-full"
                    />

                    {/* PREVIEW */}
                    {file && (
                      <div className="border p-3 rounded bg-gray-50">
                        {/* File Name */}
                        <p className="text-sm text-gray-700 mb-2">
                          📄 {file.name}
                        </p>

                        {isImage && (
                          <img
                            src={preview}
                            alt="preview"
                            className="w-full h-40 object-cover rounded mb-2"
                          />
                        )}

                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() => window.open(preview, "_blank")}
                          className="text-blue-600 text-sm underline hover:text-blue-800"
                        >
                          Preview Document
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* ERROR */}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* BUTTON */}
                <button className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
                  Register
                </button>
                <p className="text-center text-gray-500 text-sm mt-6">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-red-500 font-semibold hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </form>

            </div>

            {/* RIGHT SECTION - IMAGE */}
            <div className="hidden md:block relative bg-gradient-to-br from-red-400 to-red-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=1000&fit=crop"
                className="w-full h-full object-cover mix-blend-overlay"
                alt=""
              />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-2xl font-bold mb-2">Join Our Community</p>
                <p className="text-sm opacity-90">
                  Find your recipes, discover new flavors
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
