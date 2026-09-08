import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const OrderSuccessPage = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const order = location.state?.order;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-8 text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-semibold text-gray-900">
          {t("orderSuccess.title")}
        </h1>

        <p className="mt-4 text-gray-600">
          {t("orderSuccess.description")}
        </p>

        {/* Order Number */}

        {order?.orderNumber && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              {t("orderSuccess.orderNumber")}
            </p>

            <p className="mt-1 text-lg font-semibold">{order.orderNumber}</p>
          </div>
        )}

        {/* Total */}

        {order?.total !== undefined && (
          <div className="mt-4">
            <span className="text-gray-500">
              {t("orderSuccess.total")}:
            </span>

            <span className="ml-2 font-semibold">{order.total} EGP</span>
          </div>
        )}

        {/* Buttons */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/account/orders"
            className="flex-1 rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
          >
            {t("orderSuccess.viewMyOrders")}
          </Link>

          <Link
            to="/shop"
            className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-gray-900 transition hover:bg-gray-50"
          >
            {t("orderSuccess.continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;