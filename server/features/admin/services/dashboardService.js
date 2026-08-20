import Product from "../../catalog/models/Product.js";
import Order from "../../orders/models/Order.js";
import User from "../../auth/models/User.js";

export const getDashboardStats = async () => {
  const [totalProducts, totalOrders, totalCustomers, pendingOrders] =
    await Promise.all([
      Product.countDocuments(),

      Order.countDocuments(),

      User.countDocuments(),

      Order.countDocuments({
        orderStatus: "pending",
      }),
    ]);

  return {
    totalProducts,

    totalOrders,

    totalCustomers,

    pendingOrders,
  };
};
