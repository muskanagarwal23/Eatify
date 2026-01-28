const Menu = require("../models/menu");
const cloudinary = require("../config/cloudinary");

exports.createMenu  =async (req,res) => {
    const {name,description,price,category} = req.body;

    let imageUrl = "";

    if(req.file){
        const result = await cloudinary.uploader.upload_stream(
            { folder: "eatify/menu"},
            async (error, result) => {
              
                    if(error) throw error;

                    const item = await Menu.create({
                        vendorId:req.user.userId,
                        name,
                        description,
                        price,
                        category,
                        imageUrl:result.secure_url
                    });

                    res.status(201).json(item);
                });

                result.end(req.file.buffer);
            } else {
                const item = await Menu.create({
                    vendorId:req.user.userId,
                    name,
                    description,
                    price,
                    category
                });

                res.status(201).json(item);
            }
};

exports.getMyMenu = async (req,res) => {
    const items = await Menu.find({
        vendorId:req.user.userId
    });
    res.json(items);
};

exports.updateMenuItem = async (req, res) => {
  const item = await Menu.findOne({
    _id: req.params.id,
    vendorId: req.user.userId
  });

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  // Update text fields
  const { name, description, price, category } = req.body;
  if (name) item.name = name;
  if (description) item.description = description;
  if (price) item.price = price;
  if (category) item.category = category;

  // Replace image if new one is uploaded
  if (req.file) {
    // delete old image
    if (item.image?.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }

    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: "eatify/menu" },
      async (error, result) => {
        if (error) throw error;

        item.image = {
          url: result.secure_url,
          publicId: result.public_id
        };

        await item.save();
        res.json(item);
      }
    );

    uploadResult.end(req.file.buffer);
  } else {
    await item.save();
    res.json(item);
  }
};

exports.deleteMenuItem = async (req, res) => {
  const item = await Menu.findOne({
    _id: req.params.id,
    vendorId: req.user.userId
  });

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  if (item.image?.publicId) {
    await cloudinary.uploader.destroy(item.image.publicId);
  }

  await item.deleteOne();

  res.json({ message: "Menu item deleted" });
};

exports.toggleAvailability = async (req, res) => {
  const item = await Menu.findOne({
    _id: req.params.id,
    vendorId: req.user.userId
  });

  if (!item) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  res.json({
    message: "Availability updated",
    isAvailable: item.isAvailable
  });
};



