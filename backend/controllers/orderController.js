const Order = require("../models/order");
const Cart = require("../models/cart");

exports.placeOrder = async (req , res) => {
    const customerId = req.user.userId;

    const cart = await Cart.findOne({customerId}).populate("items.menuItem");

    if(!cart || cart.items.length === 0) {
        return res.status(400).json({message:"Cart is Empty"});
    }

    const order = await Order.create({
        customerId,
        vendorId:cart.vendorId,
        items:cart.items.map(item => ({
            menuItem:item.menuItem._id,
            name:item.menuItem.name,
            price:item.price,
            quantity:item.quantity
        })),
        totalAmount:cart.totalAmount
    });

    await Cart.findOneAndDelete({customerId});

    res.status(201).json(order);
};

exports.getMyOrders = async(req,res) => {
    const orders = await Order.find({
        customerId:req.user.userId

    }).sort({createAt:-1});

    res.json(orders);
};

exports.getVendorOrders = async (req,res) =>{
    const orders = await Order.find({
        vendorId:req.user.userId
    }).sort({createAt:-1});

    res.json(orders);
};

exports.updateOrderStatus = async (req,res) => {
    const {status} = req.body;

    const order = await Order.findOne({
        _id:req.params.id,
        vendorId:req.user.userId
    });

    if(!order){
        return res.status(404).json({message:"Order not found "});
    }

    if(!["ACCEPTED","REJECTED","PREPARING"].includes(status)){
        return res.status(400).json({message:"Invalid status"});
    }

    order.status = status;
    await order.save();

    res.json(order);
};