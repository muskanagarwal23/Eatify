const Menu = require("../models/menu");
const cloudinary = require("../config/cloudinary");
const Vendor = require("../models/vendor");

exports.createMenu = async (req, res) => {
  console.log("🔥 FILE:", req.file);
  console.log("🔥 BODY:", req.body);
  const { name, description, price, category } = req.body;

  try {
    // 🔥 find vendor using logged-in user
    const vendor = await Vendor.findOne({ userId: req.user.userId });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    let imageUrl = "";

    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "eatify/menu" },
        async (error, result) => {
          if (error) throw error;

          const item = await Menu.create({
            vendorId: vendor._id, 
            name,
            description,
            price,
            category,
            image: {
              img_url: result.secure_url, 
              publicId: result.public_id, 
            },
          });

          res.status(201).json(item);
        },
      );

      stream.end(req.file.buffer);
    } else {
      const item = await Menu.create({
        vendorId: vendor._id, // ✅ FIXED
        name,
        description,
        price,
        category,
        
      });

      res.status(201).json(item);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyMenu = async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.userId });

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  const items = await Menu.find({
    vendorId: vendor._id, // ✅ FIXED
  });

  res.json(items);
};

exports.updateMenuItem = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const item = await Menu.findOne({
      _id: req.params.id,
      vendorId: vendor._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const { name, description, price, category } = req.body;

    if (name) item.name = name;
    if (description) item.description = description;
    if (price) item.price = price;
    if (category) item.category = category;

    if (req.file) {
      if (item.image?.publicId) {
        await cloudinary.uploader.destroy(item.image.publicId);
      }

      const stream = cloudinary.uploader.upload_stream(
        { folder: "eatify/menu" },
        async (error, result) => {
          if (error) throw error;

          item.image = {
            img_url: result.secure_url,
            publicId: result.public_id,
          };

          await item.save();
          res.json(item);
        },
      );

      stream.end(req.file.buffer);
    } else {
      await item.save();
      res.json(item);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const item = await Menu.findOne({
      _id: req.params.id,
      vendorId: vendor._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (item.image?.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }

    await item.deleteOne();

    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.userId });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const item = await Menu.findOne({
      _id: req.params.id,
      vendorId: vendor._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      message: "Availability updated",
      isAvailable: item.isAvailable,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
