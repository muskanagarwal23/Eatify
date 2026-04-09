// Profile.jsx
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../features/profile/profileAPI";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../features/auth/authSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaSave, 
  FaEdit, 
  FaArrowLeft, 
  FaCamera, 
  FaUserCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaHistory,
  FaSignOutAlt
} from "react-icons/fa";
import {getMyOrders} from "../../features/orders/orderAPI";

const Profile = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      zipCode: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [orderCount, setOrderCount] = useState(0);
  const [isFetched, setIsFetched]= useState(false);
  

  useEffect(() => {
    if(isFetched) return ;
  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
       
      if(user){
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: {
          street: data.address?.street || "",
          city: data.address?.city || "",
          zipCode: data.address?.zipCode || ""
        }
      });
    }
      setIsFetched(true);

      dispatch(loginSuccess({
        user: data,
        token: localStorage.getItem("token"),
      }));

    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders();

      const orders = Array.isArray(res.data)
        ? res.data
        : res.data.orders || [];

      setOrderCount(orders.length);
    } catch (err) {
      console.log(err);
    }
  };

  fetchProfile();
  fetchOrders();
}, [user,isFetched]);




  // Update profile
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data } = await updateProfile(form);

      // update redux + navbar instantly
      dispatch(loginSuccess({
        user: data,
        token: localStorage.getItem("token"),
      }));

      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(loginSuccess({ user: null, token: null }));
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitials = () => {
    return form.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors mb-4"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Left Column - Avatar & Stats */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center sticky top-24">
              {/* Avatar */}
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt={form.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {getInitials() || <FaUserCircle className="w-16 h-16" />}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-0 right-8 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all">
                  <FaCamera className="text-gray-500 text-sm" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mt-4">{form.name || "User"}</h2>
              <p className="text-gray-500 text-sm capitalize">{user?.role?.toLowerCase() || "Customer"}</p>
              <p className="text-gray-400 text-xs mt-1">Member since {new Date().getFullYear()}</p>

              {/* Stats */}
              
                <div className="text-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaShoppingBag className="text-red-500" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{orderCount}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
                
            
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    <FaEdit className="text-sm" />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="p-6">
                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2 text-gray-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      placeholder="Enter your full name"
                      disabled={!editMode}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        editMode 
                          ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                          : "border-gray-200 bg-gray-50"
                      } outline-none transition-all`}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2 text-gray-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      placeholder="Enter your email"
                      disabled={!editMode}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        editMode 
                          ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                          : "border-gray-200 bg-gray-50"
                      } outline-none transition-all`}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline mr-2 text-gray-400" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      placeholder="Enter your phone number"
                      disabled={!editMode}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        editMode 
                          ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                          : "border-gray-200 bg-gray-50"
                      } outline-none transition-all`}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>

                  {/* Address Section */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                      Delivery Address
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={form.address.street}
                        placeholder="Street Address"
                        disabled={!editMode}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          editMode 
                            ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                            : "border-gray-200 bg-gray-50"
                        } outline-none transition-all`}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            address: { ...form.address, street: e.target.value }
                          })
                        }
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={form.address.city}
                          placeholder="City"
                          disabled={!editMode}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            editMode 
                              ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                              : "border-gray-200 bg-gray-50"
                          } outline-none transition-all`}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              address: { ...form.address, city: e.target.value }
                            })
                          }
                        />
                        <input
                          type="text"
                          value={form.address.zipCode}
                          placeholder="Zip Code"
                          disabled={!editMode}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            editMode 
                              ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                              : "border-gray-200 bg-gray-50"
                          } outline-none transition-all`}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              address: { ...form.address, zipCode: e.target.value }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {editMode ? (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="w-full border-2 border-red-500 text-red-500 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <FaHistory className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Need help with your account?</p>
                  <p className="text-xs text-gray-500">Contact our support team at <span className="text-red-500">support@eatify.com</span></p>
                </div>
                <button 
                  onClick={() => navigate("/orders")}
                  className="text-red-500 text-sm font-medium hover:text-red-600"
                >
                  View Orders →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;