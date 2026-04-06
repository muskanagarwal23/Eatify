const { getIO } = require("../socket");

exports.addTimelineEvent = async (order, status, message) => {
  order.timeline.push({
    status,
    message,
    timestamp: new Date()
  });

  await order.save();

  const io = getIO();
  console.log("📡 Emitting update for:", order._id);
  io.to(`order:${order._id}`).emit("orderTimelineUpdate", {
    orderId: order._id,
    status,
    message,
    timestamp: new Date()
  });
};