import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMyOrderById } from "../services/orderApi";

const getLocalizedText = (value, language = "en") => {
  if (!value) return "";

  // Normal object:
  // { en: "...", ar: "..." }
  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return (
      value[language] ||
      value.en ||
      value.ar ||
      ""
    );
  }

  // String that contains an object:
  // "{ en: 'sfdasf', ar: 'بسييب' }"
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    const localizedMatch = trimmedValue.match(
      /^\{\s*en\s*:\s*['"]([\s\S]*?)['"]\s*,\s*ar\s*:\s*['"]([\s\S]*?)['"]\s*\}$/
    );

    if (localizedMatch) {
      const [, enValue, arValue] = localizedMatch;

      return language === "ar"
        ? arValue || enValue || ""
        : enValue || arValue || "";
    }

    return value;
  }

  return value;
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();

  const activeLanguage = i18n.language === "ar" ? "ar" : "en";

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);

        const response = await getMyOrderById(id);

        console.log("========== ORDER RESPONSE ==========");
        console.log("Full response:", response);
        console.log("Order data:", response.data);
        console.log("Order items:", response.data?.items);

        response.data?.items?.forEach((item, index) => {
          console.log(`========== ITEM ${index + 1} ==========`);
          console.log("Full item:", item);
          console.log("Item name:", item?.name);
          console.log("Item name type:", typeof item?.name);
          console.log("Item product:", item?.product);
          console.log("Item image:", item?.image);
          console.log("Variant:", item?.variant);
        });

        console.log("====================================");

        setOrder(response.data);
      } catch (error) {
        console.error("LOAD ORDER ERROR:", error);

        setError(
          error?.response?.data?.message ||
            t("orderDetails.unableToLoadOrder")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] px-5 py-16">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center">
          <p className="text-sm tracking-wide text-[#7E8790]">
            {t("orderDetails.loadingOrder")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] px-5 py-16">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-[#E9E3D8] bg-white p-10 text-center shadow-[0_18px_50px_rgba(20,34,51,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EFE3]">
              <svg
                className="h-7 w-7 text-[#B08D57]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.7}
                  d="M12 9v4m0 4h.01M10.29 3.86l-7.36 12.75A2 2 0 004.67 19.6h14.66a2 2 0 001.74-2.99L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h1 className="mt-6 font-serif text-3xl font-normal tracking-[-0.015em] text-midnight-navy">
              {error || t("orderDetails.orderNotFound")}
            </h1>

            <Link
              to="/account/orders"
              className="mt-8 inline-flex rounded-full bg-midnight-navy px-7 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#1D2E42]"
            >
              {t("orderDetails.backToOrders")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7E8790] transition hover:text-midnight-navy"
          >
            <span className="text-lg leading-none">←</span>
            {t("orderDetails.backToOrders")}
          </Link>

          <div className="mt-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B08D57]">
              {t("orderDetails.orderDetails")}
            </p>

            <h1 className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2 font-serif text-[2.7rem] font-normal leading-[1.15] tracking-[-0.025em] text-midnight-navy sm:text-[4rem]">
              <span className="inline-block">
                {t("orderDetails.order")}
              </span>

              <span className="inline-block text-[#7E8790]">
                {t("orderDetails.summary")}
              </span>
            </h1>
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-[32px] border border-[#E9E3D8] bg-white shadow-[0_24px_70px_rgba(20,34,51,0.07)]">
          {/* Order Header */}
          <div className="border-b border-[#EEE9E0] px-6 py-7 sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A9A94]">
                  {t("orderDetails.orderNumber")}
                </p>

                <h2 className="mt-2 font-serif text-2xl font-normal tracking-[-0.015em] text-midnight-navy sm:text-3xl">
                  {order.orderNumber}
                </h2>
              </div>

              <div className="sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A9A94]">
                  {t("orderDetails.status")}
                </p>

                <span className="mt-2 inline-flex rounded-full bg-[#F5EFE3] px-4 py-2 text-sm font-medium capitalize text-[#8C6B39]">
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_0.8fr]">
            {/* Left */}
            <div className="border-b border-[#EEE9E0] p-6 sm:p-10 lg:border-b-0 lg:border-r">
              {/* Items */}
              <div>
                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B08D57]">
                    {t("orderDetails.yourSelection")}
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-normal tracking-[-0.015em] text-midnight-navy">
                    {t("orderDetails.items")}
                  </h2>
                </div>

                <div className="space-y-4">
                  {order.items?.map((item, index) => {
                    const itemName = getLocalizedText(
                      item?.name,
                      activeLanguage
                    );

                    const variantName = getLocalizedText(
                      item?.variant?.name,
                      activeLanguage
                    );

                    const variantColor = getLocalizedText(
                      item?.variant?.color,
                      activeLanguage
                    );

                    const variantSize = getLocalizedText(
                      item?.variant?.size,
                      activeLanguage
                    );

                    const variantMaterial = getLocalizedText(
                      item?.variant?.material,
                      activeLanguage
                    );

                    return (
                      <div
                        key={`${
                          item.product?._id ||
                          item.product ||
                          "item"
                        }-${index}`}
                        className="rounded-[24px] border border-[#EEE9E0] bg-[#FCFAF6] p-4 sm:p-5"
                      >
                        <div className="flex gap-4 sm:gap-5">
                          {/* Image */}
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-[#F1ECE3] sm:h-28 sm:w-28">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={itemName}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="font-serif text-xl font-normal tracking-[-0.01em] text-midnight-navy">
                                  {itemName}
                                </h3>

                                {variantName && (
                                  <p className="mt-1 text-sm text-[#7E8790]">
                                    {variantName}
                                  </p>
                                )}
                              </div>

                              <p className="shrink-0 text-base font-semibold text-midnight-navy">
                                {item.itemTotal ??
                                  item.price * item.quantity}{" "}
                                EGP
                              </p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#7E8790]">
                              <span>
                                {t("orderDetails.quantity")}:{" "}
                                <strong className="font-medium text-midnight-navy">
                                  {item.quantity}
                                </strong>
                              </span>

                              {item.price !== undefined && (
                                <span>
                                  {t("orderDetails.item")}:{" "}
                                  <strong className="font-medium text-midnight-navy">
                                    {item.price} EGP
                                  </strong>
                                </span>
                              )}
                            </div>

                            {/* Variant Details */}
                            {(variantColor ||
                              variantSize ||
                              variantMaterial) && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {variantColor && (
                                  <span className="rounded-full border border-[#E5DED1] bg-white px-3 py-1.5 text-xs text-[#6F756F]">
                                    {variantColor}
                                  </span>
                                )}

                                {variantSize && (
                                  <span className="rounded-full border border-[#E5DED1] bg-white px-3 py-1.5 text-xs text-[#6F756F]">
                                    {variantSize}
                                  </span>
                                )}

                                {variantMaterial && (
                                  <span className="rounded-full border border-[#E5DED1] bg-white px-3 py-1.5 text-xs text-[#6F756F]">
                                    {variantMaterial}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mt-10">
                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B08D57]">
                    {t("orderDetails.delivery")}
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-normal tracking-[-0.015em] text-midnight-navy">
                    {t("orderDetails.shippingAddress")}
                  </h2>
                </div>

                <div className="rounded-[24px] border border-[#EEE9E0] bg-[#FCFAF6] p-5 sm:p-6">
                  <div className="space-y-2 text-sm leading-7 text-[#66707A]">
                    <p className="font-medium text-midnight-navy">
                      {order.shippingAddress?.firstName}{" "}
                      {order.shippingAddress?.lastName}
                    </p>

                    <p>{order.shippingAddress?.phone}</p>

                    <p>{order.shippingAddress?.address}</p>

                  <p>
  {getLocalizedText(
    order.shippingAddress?.city,
    activeLanguage
  )}
  , {order.shippingAddress?.country}
</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary */}
            <aside className="p-6 sm:p-10">
              <div className="rounded-[28px] bg-midnight-navy p-6 text-white sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D8BC88]">
                  {t("orderDetails.paymentSummary")}
                </p>

                <h2 className="mt-3 font-serif text-2xl font-normal tracking-[-0.015em]">
                  {t("orderDetails.orderSummary")}
                </h2>

                <div className="mt-8 space-y-5">
                  <div className="flex items-center justify-between gap-4 text-sm text-white/65">
                    <span>{t("orderDetails.subtotal")}</span>

                    <span className="font-medium text-white">
                      {order.subtotal} EGP
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm text-white/65">
                    <span>{t("orderDetails.shipping")}</span>

                    <span className="font-medium text-white">
                      {order.shippingCost} EGP
                    </span>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm text-white/70">
                      {t("orderDetails.total")}
                    </span>

                    <span className="font-serif text-3xl font-normal text-[#E5CC9E]">
                      {order.total} EGP
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;