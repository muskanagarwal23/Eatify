const transitions = {
  PLACED: ["PAID", "ACCEPTED","REJECTED"],
  PAID: ["ACCEPTED"],
  ACCEPTED: ["PREPARING"],
  PREPARING: ["DELIVERY_ASSIGNED"],
  DELIVERY_ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["DELIVERED"],
  DELIVERED: [],
  REJECTED:[]
};

exports.canTransition = (current, next) => {
  return transitions[current]?.includes(next);
};
