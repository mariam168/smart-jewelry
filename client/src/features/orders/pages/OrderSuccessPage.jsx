import { Link, useLocation } from "react-router-dom";

const OrderSuccessPage = () => {
  const location = useLocation();

  const order = location.state?.order;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-8 text-center">
        {/* Success Icon */}

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
          Order Placed Successfully!
        </h1>

        <p className="mt-4 text-gray-600">
          Thank you for your order. We have received your order and will start
          processing it soon.
        </p>

        {/* Order Number */}

        {order?.orderNumber && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Order Number</p>

            <p className="mt-1 text-lg font-semibold">{order.orderNumber}</p>
          </div>
        )}

        {/* Total */}

        {order?.total !== undefined && (
          <div className="mt-4">
            <span className="text-gray-500">Total:</span>

            <span className="ml-2 font-semibold">{order.total} EGP</span>
          </div>
        )}

        {/* Buttons */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/account/orders"
            className="flex-1 rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
          >
            View My Orders
          </Link>

          <Link
            to="/shop"
            className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-gray-900 transition hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
