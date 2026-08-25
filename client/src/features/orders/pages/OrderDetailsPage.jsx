import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { getMyOrderById } from "../services/orderApi";

const OrderDetailsPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);

        const response = await getMyOrderById(id);

        setOrder(response.data);
      } catch (error) {
        setError(error?.response?.data?.message || "Unable to load order");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading order...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/account/orders"
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back to My Orders
        </Link>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>

              <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>

              <p className="font-semibold capitalize">{order.orderStatus}</p>
            </div>
          </div>

          {/* Products */}

          <div className="mt-8">
            <h2 className="text-xl font-semibold">Items</h2>

            <div className="mt-5 space-y-5">
              {order.items.map((item, index) => (
                <div
                  key={`${item.product?._id || item.product}-${index}`}
                  className="flex gap-4 border-b pb-5"
                >
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {item.price * item.quantity} EGP
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}

          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-semibold">Shipping Address</h2>

            <div className="mt-4 text-gray-600">
              <p>
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </p>

              <p>{order.shippingAddress.phone}</p>

              <p>{order.shippingAddress.address}</p>

              <p>
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </p>
            </div>
          </div>

          {/* Summary */}

          <div className="mt-8 border-t pt-8">
            <div className="ml-auto max-w-sm space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{order.subtotal} EGP</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shippingCost} EGP</span>
              </div>

              <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                <span>Total</span>
                <span>{order.total} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
