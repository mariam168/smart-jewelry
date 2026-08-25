import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { getMyOrders } from "../services/orderApi";

const getStatusStyle = (status) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "shipped":
      return "bg-blue-100 text-blue-700";

    case "processing":
      return "bg-yellow-100 text-yellow-700";

    case "confirmed":
      return "bg-purple-100 text-purple-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);

        const response = await getMyOrders();

        setOrders(response.data || []);
      } catch (error) {
        setError(error?.response?.data?.message || "Unable to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">My Orders</h1>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              You don't have any orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              Start shopping and your orders will appear here.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-white"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>

                    <p className="font-semibold">{order.orderNumber}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Date</p>

                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Total</p>

                    <p className="font-semibold">{order.total} EGP</p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${getStatusStyle(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus}
                  </span>

                  <Link
                    to={`/account/orders/${order._id}`}
                    className="rounded-xl border border-gray-300 px-5 py-2 text-center text-sm hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
