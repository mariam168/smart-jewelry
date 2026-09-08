import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
        setError(
          error?.response?.data?.message ||
            t("myOrders.unableToLoadOrders")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("myOrders.loadingOrders")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">
          {t("myOrders.title")}
        </h1>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              {t("myOrders.noOrders")}
            </h2>

            <p className="mt-2 text-gray-500">
              {t("myOrders.noOrdersDescription")}
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-white"
            >
              {t("myOrders.startShopping")}
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
                    <p className="text-sm text-gray-500">
                      {t("myOrders.orderNumber")}
                    </p>

                    <p className="font-semibold">
                      {order.orderNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {t("myOrders.date")}
                    </p>

                    <p>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {t("myOrders.total")}
                    </p>

                    <p className="font-semibold">
                      {order.total} EGP
                    </p>
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
                    {t("myOrders.viewDetails")}
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