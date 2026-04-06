// VendorMenu.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUtensils,
  FaRupeeSign,
  FaInfoCircle,
  FaImage,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaSave,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  createMenu,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvail,
} from "../../features/vendor/vendorAPI";

const VendorMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
    isAvailable: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await getMenuItem();

      setMenuItems(res.data || []);
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category || "",
        image: null,
        isAvailable: item.isAvailable,
      });
      setImagePreview(item.image?.img_url || null);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
        isAvailable: true,
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: null,
      isAvailable: true,
    });
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      if (editingItem) {
        await updateMenuItem(editingItem._id, formDataToSend);
      } else {
        await createMenu(formDataToSend);
      }

      toast.success("Item saved successfully");
      fetchMenuItems();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving item:", error.message || error.response?.data);
      toast.error("Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem(id);
        fetchMenuItems();
        toast.success("Item deleted successfully");
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error("Failed to delete item");
      }
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await toggleAvail(id);
      fetchMenuItems();
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Failed to update availability");
    }
  };

  // Get unique categories
  const categories = [
    "all",
    ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
  ];

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      Starter: "bg-orange-100 text-orange-700",
      "Main Course": "bg-red-100 text-red-700",
      Pizza: "bg-yellow-100 text-yellow-700",
      Burger: "bg-green-100 text-green-700",
      Pasta: "bg-blue-100 text-blue-700",
      Dessert: "bg-pink-100 text-pink-700",
      Beverages: "bg-cyan-100 text-cyan-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-full w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl shadow-md animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded-t-xl"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Menu Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your restaurant's food items
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2.5 rounded-full font-semibold hover:shadow-lg transition-all"
          >
            <FaPlus className="text-sm" />
            Add New Item
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat === "all" ? "All Items" : cat}
                {cat !== "all" && (
                  <span className="ml-2 text-xs opacity-75">
                    ({menuItems.filter((i) => i.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Total Items</p>
            <p className="text-2xl font-bold text-gray-800">
              {menuItems.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Available</p>
            <p className="text-2xl font-bold text-green-600">
              {menuItems.filter((i) => i.isAvailable).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Categories</p>
            <p className="text-2xl font-bold text-orange-600">
              {categories.length - 1}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Avg Price</p>
            <p className="text-2xl font-bold text-red-600">
              ₹
              {menuItems.length
                ? Math.round(
                    menuItems.reduce((acc, i) => acc + i.price, 0) /
                      menuItems.length,
                  )
                : 0}
            </p>
          </div>
        </div>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUtensils className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No menu items found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Start adding your delicious food items"}
            </p>
            {searchTerm || selectedCategory !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="text-red-500 font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => handleOpenModal()}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  !item.isAvailable ? "opacity-75" : ""
                }`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      item.image?.img_url ||
                      
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                    }
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Unavailable
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() =>
                        toggleAvailability(item._id, item.isAvailable)
                      }
                      className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                      title={
                        item.isAvailable ? "Hide from menu" : "Show on menu"
                      }
                    >
                      {item.isAvailable ? (
                        <FaEye className="text-green-600 text-sm" />
                      ) : (
                        <FaEyeSlash className="text-red-600 text-sm" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 flex-1">
                      {item.name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {item.category && (
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full mb-2 ${getCategoryColor(item.category)}`}
                    >
                      {item.category}
                    </span>
                  )}

                  {item.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <FaRupeeSign className="text-gray-500 text-sm" />
                      <span className="font-bold text-gray-800 text-lg">
                        {item.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FaInfoCircle />
                      <span>ID: {item._id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                    placeholder="Describe your dish..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                      placeholder="e.g., 299"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="Starter">Starter</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Burger">Burger</option>
                      <option value="Pasta">Pasta</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-40 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, image: null });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          Click to upload image
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">
                      Available to customers
                    </p>
                    <p className="text-sm text-gray-500">
                      Toggle to show/hide on menu
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isAvailable: !formData.isAvailable,
                      })
                    }
                    className="text-2xl"
                  >
                    {formData.isAvailable ? (
                      <FaToggleOn className="text-green-500" />
                    ) : (
                      <FaToggleOff className="text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        {editingItem ? "Update Item" : "Add Item"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorMenu;
