// VendorProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getVendorProfile,
  createVendorProfile,
} from "../../features/vendor/vendorAPI";
import {
  FaEdit,
  FaSave,
  FaArrowLeft,
  FaStore,
  FaMapMarkerAlt,
  FaPhone,
  FaUtensils,
  FaRupeeSign,
  FaInfoCircle,
  FaCamera,
  FaTimes,
  FaCheck,
  FaStar,
} from "react-icons/fa";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLAyout";

const VendorProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: "",
    description: "",
    phone: "",
    avgPrice: "",
    address: {
      street: "",
      city: "",
      zipCode: "",
    },
    cuisine: "",
    deliveryTime: "",
    isOpen: true,
  });

  const [banner, setBanner] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getVendorProfile();
        const data = res.data;

        setFormData({
          restaurantName: data.restaurantName || "",
          description: data.description || "",
          phone: data.phone || "",
          avgPrice: data.avgPrice || "",
          cuisine: data.cuisine?.join(", ") || "",
          deliveryTime: data.deliveryTime || "",
          isOpen: data.isOpen !== undefined ? data.isOpen : true,
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            zipCode: data.address?.zipCode || "",
          },
        });

        setBanner(data.bannerUrl || null);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          // No profile found, user can create one
          toast.error("Complete your vendor profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["street", "city", "zipCode"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Create FormData for image uploads
      const submitData = new FormData();
      submitData.append("restaurantName", formData.restaurantName);
      submitData.append("description", formData.description);
      submitData.append("phone", formData.phone);
      submitData.append("avgPrice", formData.avgPrice);
      submitData.append("deliveryTime", formData.deliveryTime);
      submitData.append("isOpen", formData.isOpen);
      formData.cuisine
        .split(",")
        .map((c) => c.trim())
        .forEach((c) => {
          submitData.append("cuisine", c);
        });
      submitData.append("street", formData.address.street);
      submitData.append("city", formData.address.city);
      submitData.append("zipCode", formData.address.zipCode);

      console.log("BANNER FILE:", bannerFile);
      console.log("PROFILE FILE:", profileFile);

      if (bannerFile) submitData.append("banner", bannerFile);

      await createVendorProfile(submitData);

      const res = await getVendorProfile();
      const updated = res.data;

      setFormData({
        restaurantName: updated.restaurantName || "",
        description: updated.description || "",
        phone: updated.phone || "",
        avgPrice: updated.avgPrice || "",
        cuisine: updated.cuisine?.join(", ") || "",
        deliveryTime: updated.deliveryTime || "",
        isOpen: updated.isOpen ?? true,
        address: {
          street: updated.address?.street || "",
          city: updated.address?.city || "",
          zipCode: updated.address?.zipCode || "",
        },
      });

      setBanner(updated.bannerUrl || null);

      if (bannerFile) localStorage.setItem("vendorBanner", banner);

      
      toast.success("Profile updated successfully");
      setTimeout(()=> navigate("/vendor/dashboard"), 800);
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
    
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    if (type === "banner") {
      setBanner(url);
      setBannerFile(file);
    }
  };

  const removeImage = (type) => {
    if (type === "banner") {
      setBanner(null);
      setBannerFile(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-6 -mt-12"></div>
            <div className="bg-white rounded-xl p-6 mt-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VendorLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full flex items-center gap-2 font-semibold hover:shadow-lg transition-all disabled:opacity-50`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save Changes
              </>
            )} 
          </button>
        </div>

        {/* Banner Section */}
        <div className="relative h-56 rounded-2xl overflow-hidden bg-gradient-to-r from-red-500 to-orange-500">
          {banner ? (
            <img
              src={banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaStore className="text-white text-6xl opacity-50" />
            </div>
          )}
          {editMode && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4">
              <label className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full cursor-pointer transition-all">
                <FaCamera className="inline mr-2" />
                Upload Banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "banner")}
                  className="hidden"
                />
              </label>
              {banner && (
                <button
                  onClick={() => removeImage("banner")}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all"
                >
                  <FaTimes className="inline mr-1" />
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile Image */}
        <div className="relative -mt-16 ml-8">
          <div className="relative inline-block">
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-all">
                <FaCamera className="text-red-500 text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "profile")}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
            <FaStore className="text-red-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Restaurant Information
            </h2>
            {!editMode && formData.restaurantName && (
              <div className="ml-auto flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                <FaCheck className="text-green-600 text-xs" />
                <span className="text-xs text-green-700">Profile Active</span>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <div className="relative">
                <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  disabled={false}
                  placeholder="Enter restaurant name"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    editMode
                      ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 bg-gray-50"
                  } outline-none transition-all`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FaInfoCircle className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={false}
                  rows="3"
                  placeholder="Describe your restaurant, specialties, ambiance, etc."
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    editMode
                      ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 bg-gray-50"
                  } outline-none transition-all`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={false}
                    placeholder="+91 XXXXX XXXXX"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      editMode
                        ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 bg-gray-50"
                    } outline-none transition-all`}
                  />
                </div>
              </div>

              {/* Average Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Price (for two)
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="avgPrice"
                    value={formData.avgPrice}
                    onChange={handleChange}
                    disabled={false}
                    placeholder="e.g., 500"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      editMode
                        ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 bg-gray-50"
                    } outline-none transition-all`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Cuisine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine 
                </label>
                <div className="relative">
                  <FaUtensils className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    disabled={false}
                    placeholder="Italian, Pizza, Fast Food (comma separated)"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      editMode
                        ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 bg-gray-50"
                    } outline-none transition-all`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Separate multiple cuisines with commas
                </p>
              </div>

              {/* Delivery Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time (minutes)
                </label>
                <input
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  disabled={false}
                  placeholder="e.g., 25-35"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    editMode
                      ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 bg-gray-50"
                  } outline-none transition-all`}
                />
              </div>
            </div>

            {/* Address Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FaMapMarkerAlt className="inline mr-2 text-red-400" />
                Restaurant Address
              </label>
              <div className="space-y-3">
                <input
                  name="street"
                  value={formData.address.street}
                  onChange={handleChange}
                  disabled={false}
                  placeholder="Street Address"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    editMode
                      ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 bg-gray-50"
                  } outline-none transition-all`}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="city"
                    value={formData.address.city}
                    onChange={handleChange}
                    disabled={false}
                    placeholder="City"
                    className={`px-4 py-3 rounded-lg border ${
                      editMode
                        ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 bg-gray-50"
                    } outline-none transition-all`}
                  />
                  <input
                    name="zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    disabled={false}
                    placeholder="Zip Code"
                    className={`px-4 py-3 rounded-lg border ${
                      editMode
                        ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 bg-gray-50"
                    } outline-none transition-all`}
                  />
                </div>
              </div>
            </div>

            {/* Open/Closed Status */}
            {editMode && (
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isOpen"
                    value="true"
                    checked={formData.isOpen === true}
                    onChange={() => setFormData({ ...formData, isOpen: true })}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="text-gray-700">Open Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isOpen"
                    value="false"
                    checked={formData.isOpen === false}
                    onChange={() => setFormData({ ...formData, isOpen: false })}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="text-gray-700">Closed</span>
                </label>
              </div>
            )}
          </div>
        </div>

       
      </div>
    </div>
    </VendorLayout>
  );
};

export default VendorProfile;
