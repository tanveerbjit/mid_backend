const mongoose = require("mongoose");

const ORDER_STATUS = {
  PROCESSED: [0, "PROCESSED"],
  DELIVERED: [1, "DELIVERED"],
  SHIPPED: [2, "SHIPPED"],
};

const OrderSchema = new mongoose.Schema(
  {
    order_number: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderStatus: { type: Number, default: ORDER_STATUS.PROCESSED[0] },
    orderItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        _id:false,
      },
    ],
    total_bill: { type: Number },
  },
  { timestamps: true }
);



const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
