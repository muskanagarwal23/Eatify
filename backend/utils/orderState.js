const transitions = {
  PLACED: ["PAID", "ACCEPTED","REJECTED"],
  PAID: ["ACCEPTED"],
  ACCEPTED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["DELIVERY_ASSIGNED"],
  DELIVERY_ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["OUT_FOR_DELIVERY","DELIVERED"],
  DELIVERED: [],
  REJECTED:[]
};

exports.canTransition = (current, next) => {
  return transitions[current]?.includes(next);
};
