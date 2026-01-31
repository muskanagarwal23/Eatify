const Cart = require("../models/cart");
const Menu = require("../models/menu");

exports.addToCart = async (req, res) => {
  const { menuItemId, quantity } = req.body;
  const customerId = req.user.userId;

  const menuItem = await Menu.findOne({
    _id: menuItemId,
    isAvailable: true
  });

  if (!menuItem) {
    return res.status(404).json({ message: "Item not available" });
  }

  let cart = await Cart.findOne({ customerId });

  // If cart exists but vendor differs → reject
  if (cart && cart.vendorId.toString() !== menuItem.vendorId.toString()) {
    return res.status(400).json({
      message: "Cart already contains items from another restaurant"
    });
  }

  if (!cart) {
    cart = await Cart.create({
      customerId,
      vendorId: menuItem.vendorId,
      items: [],
      totalAmount: 0
    });
  }

  const existingItem = cart.items.find(
    item => item.menuItem.toString() === menuItemId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      menuItem: menuItemId,
      quantity,
      price: menuItem.price
    });
  }

  cart.totalAmount = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await cart.save();

  res.json(cart);
};

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({
    customerId: req.user.userId
  }).populate("items.menuItem", "name image price");

  res.json(cart || { items: [], totalAmount: 0 });
};


exports.updateQuantity = async (req, res) => {
  const { menuItemId, quantity } = req.body;

  const cart = await Cart.findOne({
    customerId: req.user.userId
  });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const item = cart.items.find(
    i => i.menuItem.toString() === menuItemId
  );

  if (!item) {
    return res.status(404).json({ message: "Item not in cart" });
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      i => i.menuItem.toString() !== menuItemId
    );
  } else {
    item.quantity = quantity;
  }

  cart.totalAmount = cart.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  await cart.save();
  res.json(cart);
};


exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({
    customerId: req.user.userId
  });

  res.json({ message: "Cart cleared" });
};
