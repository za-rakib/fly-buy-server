const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/orderItem");
const router = express.Router();

// get all orders
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ orderDate: -1 });
  if (!orderList) {
    res.status(500).json({
      success: false,
    });
  }
  //console.log("orderList", orderList);
  res.send(orderList);
});

//get order by id
router.get(`/:id`, async (req, res) => {
  const orderList = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
  if (!orderList) {
    res.status(500).json({
      success: false,
    });
  }
  //console.log("orderList", orderList);
  res.send(orderList);
});

// order post
router.post(`/`, async (req, res) => {
  //order item id
  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  //   const orderItemsIdsResolved = await orderItemsIds;
  //console.log("ID",orderItemsIdsResolved);

  //total price calculation
  const totalPrices = await Promise.all(
    orderItemsIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  // console.log("totalPrices", totalPrices);

  let order = new Order({
    orderItems: orderItemsIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
    orderDate: req.body.orderDate,
  });

  order = await order.save();
  if (!order) return res.status(404).send("The order can not be created");
  res.send(order);
});

// order updated
router.put(`/:id`, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );
  if (!order) {
    res.status(400).json({ message: "The order cannot be updated" });
  }
  res.status(200).send(order);
});

// order delete
router.delete(`/:id`, (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is delete" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order is not find" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ success: false, error: error });
    });
});

//total Sales
router.get(`/get/totalSales`, async (req, res) => {
  const totalSales = await Order.aggregate([
    {
      $group: { _id: null, totalSales: { $sum: "$totalPrice" } },
    },
  ]);
  if (!totalSales)
    return res
      .status(404)
      .json({ success: false, message: "The order sales can not be granted" });
  res.status(200).send({ totalSales: totalSales.pop().totalSales });
});

// get total Order number
router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments({});
    if (!orderCount) {
      res.status(500).json({ success: false });
    }
    res.send({
        orderCount: orderCount,
    });
  });
module.exports = router;
