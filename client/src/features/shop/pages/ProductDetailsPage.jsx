import { useEffect, useMemo, useState } from "react";

import { Link, useParams, useSearchParams } from "react-router-dom";

import {
  getShopProduct,
  getProductImages,
  getProductVariants,
  getProductTechnologies,
} from "../services/shopApi";

import { useCart } from "../../../context/CartContext";

const getBackendOrigin = () => {
  const explicitBackend = import.meta.env.VITE_BACKEND_URL;

  if (explicitBackend) {
    return String(explicitBackend).replace(/\/+$/, "");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return String(apiUrl)
      .replace(/\/api\/?$/i, "")
      .replace(/\/+$/, "");
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

const API_URL = getBackendOrigin();

const getFilePath = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const path = getFilePath(item);

      if (path) {
        return path;
      }
    }

    return "";
  }

  if (typeof value === "object") {
    return (
      getFilePath(value.imageUrl) ||
      getFilePath(value.url) ||
      getFilePath(value.path) ||
      getFilePath(value.src) ||
      getFilePath(value.image) ||
      getFilePath(value.file) ||
      getFilePath(value.filename) ||
      ""
    );
  }

  return "";
};

const getImageUrl = (value) => {
  let image = getFilePath(value);

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  if (image.startsWith("//")) {
    const protocol =
      typeof window !== "undefined" ? window.location.protocol : "https:";

    return `${protocol}${image}`;
  }

  if (image.startsWith("/api/uploads/")) {
    image = image.replace(/^\/api/, "");
  }

  if (image.startsWith("/assets/") || image.startsWith("/images/")) {
    return image;
  }

  return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const ProductDetailsPage = () => {
  const { id } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();

  const [product, setProduct] = useState(null);

  const [images, setImages] = useState([]);

  const [variants, setVariants] = useState([]);

  const [productTechnologies, setProductTechnologies] = useState([]);

  const [selectedTechnology, setSelectedTechnology] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(null);

  const [selectedColor, setSelectedColor] = useState("");

  const [selectedSize, setSelectedSize] = useState("");

  const [selectedImage, setSelectedImage] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const { addToCart, isLoading: isCartLoading } = useCart();

  const [addedToCart, setAddedToCart] = useState(false);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("en-EG", {
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);

        setError("");

        setQuantity(1);

        setAddedToCart(false);

        setSelectedColor("");

        setSelectedSize("");

        setSelectedVariant(null);

        setSelectedImage("");

        setSelectedTechnology(null);

        setProductTechnologies([]);

        const [
          productResponse,
          imagesResponse,
          variantsResponse,
          technologiesResponse,
        ] = await Promise.all([
          getShopProduct(id),

          getProductImages(id).catch(() => []),

          getProductVariants(id).catch(() => []),

          getProductTechnologies(id).catch(() => []),
        ]);

        const currentProduct =
          productResponse?.product ||
          productResponse?.data?.product ||
          productResponse?.data ||
          productResponse;

        if (!currentProduct) {
          throw new Error("Product not found.");
        }

        setProduct(currentProduct);

        const loadedImages =
          imagesResponse?.data?.images ||
          imagesResponse?.images ||
          imagesResponse ||
          [];

        const safeImages = Array.isArray(loadedImages) ? loadedImages : [];

        setImages(safeImages);

        if (safeImages.length > 0) {
          const primaryImage = safeImages.find((image) => image.isPrimary);

          setSelectedImage(
            getImageUrl(primaryImage?.imageUrl || safeImages[0]?.imageUrl),
          );
        } else {
          setSelectedImage(
            getImageUrl(
              currentProduct.primaryImage || currentProduct.image || "",
            ),
          );
        }

        const loadedVariants =
          variantsResponse?.data?.variants ||
          variantsResponse?.variants ||
          variantsResponse ||
          [];

        const activeVariants = Array.isArray(loadedVariants)
          ? loadedVariants.filter((variant) => variant.isActive !== false)
          : [];

        setVariants(activeVariants);

        setSelectedVariant(null);

        setSelectedColor("");

        setSelectedSize("");

        const loadedTechnologies =
          technologiesResponse?.data?.productTechnologies ||
          technologiesResponse?.data?.technologies ||
          technologiesResponse?.productTechnologies ||
          technologiesResponse?.technologies ||
          technologiesResponse ||
          [];

        const safeTechnologies = Array.isArray(loadedTechnologies)
          ? loadedTechnologies.filter(
              (technology) =>
                technology?.status !== "inactive" &&
                technology?.isActive !== false &&
                technology?.isSelectable !== false,
            )
          : [];

        setProductTechnologies(safeTechnologies);

        const defaultTechnology =
          safeTechnologies.find(
            (technology) => technology?.isDefault === true,
          ) ||
          safeTechnologies[0] ||
          null;

        const requestedWithoutTechnology =
          new URLSearchParams(
            typeof window !== "undefined" ? window.location.search : "",
          ).get("technology") === "none";

        const startWithoutTechnology =
          currentProduct.technologyRequired === true
            ? false
            : requestedWithoutTechnology;

        setSelectedTechnology(
          startWithoutTechnology ? null : defaultTechnology,
        );

        if (
          currentProduct.technologyRequired === true &&
          requestedWithoutTechnology
        ) {
          const nextParams = new URLSearchParams(
            typeof window !== "undefined" ? window.location.search : "",
          );

          nextParams.delete("technology");

          setSearchParams(nextParams, {
            replace: true,
          });
        }
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load product.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const technologyModels = product?.technologyModels || [];

  const technologyRequired = product?.technologyRequired === true;

  const colors = useMemo(() => {
    return [
      ...new Set(variants.map((variant) => variant.color).filter(Boolean)),
    ];
  }, [variants]);

  const sizes = useMemo(() => {
    if (!selectedColor) {
      return [];
    }

    return [
      ...new Set(
        variants
          .filter((variant) => variant.color === selectedColor)
          .map((variant) => variant.size)
          .filter(Boolean),
      ),
    ];
  }, [variants, selectedColor]);

  const handleColorChange = (color) => {
    setSelectedColor(color);

    const colorVariants = variants.filter((variant) => variant.color === color);

    if (colorVariants.length === 0) {
      return;
    }

    setSelectedVariant(null);

    setSelectedSize("");

    setQuantity(1);

    const firstColorVariant = colorVariants[0];

    if (firstColorVariant.image) {
      setSelectedImage(getImageUrl(firstColorVariant.image));
    } else {
      setSelectedImage(
        getImageUrl(product?.primaryImage || product?.image || ""),
      );
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);

    const variant = variants.find(
      (item) => item.color === selectedColor && item.size === size,
    );

    if (!variant) {
      return;
    }

    setSelectedVariant(variant);

    if (variant.image) {
      setSelectedImage(getImageUrl(variant.image));
    } else {
      setSelectedImage(
        getImageUrl(product?.primaryImage || product?.image || ""),
      );
    }

    setQuantity(1);
  };

  const setTechnologyPreferenceInUrl = (withoutTechnology) => {
    const nextParams = new URLSearchParams(searchParams);

    if (withoutTechnology && !technologyRequired) {
      nextParams.set("technology", "none");
    } else {
      nextParams.delete("technology");
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleTechnologyChange = (productTechnology) => {
    setSelectedTechnology(productTechnology);

    setTechnologyPreferenceInUrl(false);

    setQuantity(1);

    setAddedToCart(false);
  };

  const handleRemoveTechnology = () => {
    if (technologyRequired) {
      return;
    }

    setSelectedTechnology(null);

    setTechnologyPreferenceInUrl(true);

    setQuantity(1);

    setAddedToCart(false);
  };

  const technologyExtraPrice = Number(
    selectedTechnology?.extraPrice ?? selectedTechnology?.additionalPrice ?? 0,
  );

  const baseSellingPrice = Number(
    selectedVariant?.price ?? product?.price ?? 0,
  );

  const baseComparePrice = Number(
    selectedVariant?.compareAtPrice ?? product?.comparePrice ?? 0,
  );

  const hasDiscount =
    baseComparePrice > 0 &&
    baseSellingPrice > 0 &&
    baseComparePrice > baseSellingPrice;

  const currentPrice = baseSellingPrice + technologyExtraPrice;

  const comparePrice = hasDiscount
    ? baseComparePrice + technologyExtraPrice
    : 0;

  const saving = hasDiscount ? comparePrice - currentPrice : 0;

  const discountPercentage =
    hasDiscount && comparePrice > 0
      ? Math.round((saving / comparePrice) * 100)
      : 0;

  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;

  const currentImage =
    selectedImage ||
    getImageUrl(
      selectedVariant?.image || product?.primaryImage || product?.image || "",
    );

  const isOutOfStock = Number(currentStock || 0) <= 0;

  const isInactive = product?.status !== "active";

  const isUnavailable = isOutOfStock || isInactive;

  const increaseQuantity = () => {
    if (quantity < currentStock) {
      setQuantity((previous) => previous + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((previous) => previous - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    if (variants.length > 0 && !selectedVariant) {
      alert("Please select a variant.");

      return;
    }

    if (technologyRequired && !selectedTechnology) {
      alert(
        "Smart Technology is required for this product. Please select a technology option.",
      );

      return;
    }

    try {
      await addToCart(
        product._id,
        quantity,
        selectedVariant?._id || null,
        selectedTechnology?._id || null,
      );

      setAddedToCart(true);
    } catch (error) {
      console.error("Add To Cart Error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[100px]" />

        <div className="relative text-center">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/30 bg-midnight-navy text-lg text-champagne-gold shadow-[0_14px_35px_rgba(18,38,58,0.18)]">
            <span className="animate-pulse">✦</span>
          </div>

          <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.35em] text-slate-gray">
            Loading Product
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-ivory px-6">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[120px]" />

        <div className="relative w-full max-w-md rounded-[28px] border border-light-champagne bg-soft-white/90 p-9 text-center shadow-[0_25px_60px_rgba(7,19,31,0.08)] backdrop-blur-md sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-midnight-navy text-lg text-champagne-gold shadow-[0_10px_25px_rgba(18,38,58,0.18)]">
            !
          </div>

          <p className="mt-6 text-[13px] leading-7 text-antique-gold">
            {error}
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-[12px] bg-midnight-navy px-7 text-[9px] font-semibold uppercase tracking-[0.16em] text-soft-white shadow-[0_10px_25px_rgba(18,38,58,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy"
          >
            Back To Shop
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-ivory font-serif text-2xl text-midnight-navy">
        Product Not Found
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-48 top-1/3 h-[500px] w-[500px] rounded-full bg-light-champagne/50 blur-[130px]" />

      <div className="pointer-events-none fixed -right-48 top-10 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.07] blur-[130px]" />

      <div className="relative border-b border-light-champagne/80 bg-soft-white/55 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-6 py-4 text-[8px] font-semibold uppercase tracking-[0.2em] sm:px-8 lg:px-10 xl:px-12">
          <Link
            to="/shop"
            className="text-steel-gray transition-colors duration-300 hover:text-classic-gold"
          >
            Shop
          </Link>

          <span className="text-classic-gold">/</span>

          <span className="max-w-[220px] truncate text-midnight-navy">
            {product.name}
          </span>
        </div>
      </div>

      <main className="relative mx-auto max-w-[1360px] px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16 xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12 xl:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[30px] border border-light-champagne/80 bg-soft-cream shadow-[0_25px_70px_rgba(7,19,31,0.08)]">
              <div className="pointer-events-none absolute -right-24 -top-24 z-10 h-64 w-64 rounded-full border border-champagne-gold/15" />

              <div className="pointer-events-none absolute -bottom-24 -left-20 z-10 h-56 w-56 rounded-full border border-champagne-gold/10" />

              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-soft-white/15 via-transparent to-midnight-navy/[0.04]" />

              {hasDiscount && (
                <div className="absolute right-6 top-6 z-30">
                  <span className="inline-flex rounded-full border border-champagne-gold/60 bg-midnight-navy/95 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-champagne-gold shadow-lg backdrop-blur-md">
                    {discountPercentage}% OFF
                  </span>
                </div>
              )}

              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="relative h-[500px] w-full object-contain p-3 transition-transform duration-700 hover:scale-[1.015] sm:h-[610px] sm:p-5 lg:h-[650px]"
                />
              ) : (
                <div className="flex h-[500px] items-center justify-center bg-soft-cream text-[9px] font-semibold uppercase tracking-[0.24em] text-steel-gray sm:h-[610px] lg:h-[650px]">
                  No Image
                </div>
              )}

              <div className="pointer-events-none absolute bottom-6 left-6 z-20 flex items-center gap-2 rounded-full border border-soft-white/70 bg-soft-white/75 px-4 py-2 backdrop-blur-md">
                <span className="text-[8px] text-classic-gold">✦</span>

                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-midnight-navy">
                  Smart Jewelry
                </span>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2.5 sm:gap-3">
                {images.map((image) => {
                  const imageUrl = getImageUrl(image.imageUrl);

                  return (
                    <button
                      type="button"
                      key={image._id}
                      onClick={() => setSelectedImage(imageUrl)}
                      className={`group relative overflow-hidden rounded-[14px] border bg-soft-white p-1 transition-all duration-300 ${
                        selectedImage === imageUrl
                          ? "border-classic-gold shadow-[0_8px_22px_rgba(201,162,77,0.14)]"
                          : "border-light-champagne hover:border-champagne-gold"
                      }`}
                    >
                      <div className="overflow-hidden rounded-[10px] bg-soft-cream">
                        <img
                          src={imageUrl}
                          alt={image.alt || product.name}
                          className="h-16 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-20 lg:h-24"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-classic-gold/60" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-antique-gold">
                {product.category?.name || "Collection"}
              </p>

              <span className="text-[8px] text-classic-gold">✦</span>
            </div>

            <h1 className="mt-5 max-w-[620px] font-serif text-[3rem] font-normal leading-[0.98] tracking-[-0.04em] text-midnight-navy sm:text-[3.8rem] lg:text-[4.2rem]">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-6 max-w-xl text-[13px] leading-7 text-slate-gray sm:text-[14px] sm:leading-8">
                {product.shortDescription}
              </p>
            )}

            <div className="relative mt-8 overflow-hidden rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_10px_32px_rgba(7,19,31,0.04)] backdrop-blur-sm sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-champagne-gold/10 blur-[55px]" />

              {hasDiscount && (
                <div className="relative mb-3 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-midnight-navy px-3.5 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-champagne-gold">
                    Sale
                  </span>

                  <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-antique-gold">
                    {discountPercentage}% OFF
                  </span>
                </div>
              )}

              <div className="relative flex flex-wrap items-end gap-x-4 gap-y-2">
                <h2 className="font-serif text-[2.65rem] font-normal tracking-[-0.035em] text-midnight-navy">
                  {formatMoney(currentPrice)} EGP
                </h2>

                {hasDiscount && (
                  <span className="pb-1.5 text-[15px] text-steel-gray line-through">
                    {formatMoney(comparePrice)} EGP
                  </span>
                )}
              </div>

              {technologyExtraPrice > 0 && (
                <p className="relative mt-3 text-[10px] tracking-[0.02em] text-slate-gray">
                  Base price: {formatMoney(baseSellingPrice)} EGP
                  {" + "}
                  Technology: {formatMoney(technologyExtraPrice)} EGP
                </p>
              )}

              {hasDiscount && (
                <div className="relative mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex rounded-full border border-champagne-gold/25 bg-soft-cream px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-antique-gold">
                    You Save {formatMoney(saving)} EGP
                  </div>
                </div>
              )}
            </div>

            {productTechnologies.length > 0 && (
              <div className="mt-7 rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_10px_32px_rgba(7,19,31,0.04)] backdrop-blur-sm sm:p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-midnight-navy text-[11px] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.14)]">
                      ✦
                    </span>

                    <div>
                      <h2 className="font-serif text-[1.45rem] font-normal text-midnight-navy">
                        Smart Technology
                      </h2>

                      <p className="mt-1 text-[10px] leading-5 text-steel-gray">
                        {technologyRequired
                          ? "Smart Technology is required for this piece. You can change the technology model, but it cannot be removed."
                          : "Technology is included by default. You can change it or remove it."}
                      </p>
                    </div>
                  </div>

                  {technologyRequired ? (
                    <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-champagne-gold/35 bg-soft-cream px-4 py-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[9px] text-champagne-gold">
                        ✦
                      </span>

                      <div>
                        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-antique-gold">
                          Technology Required
                        </p>

                        <p className="mt-1.5 text-[10px] leading-5 text-slate-gray">
                          This jewelry piece must be ordered with Smart
                          Technology. You may choose another available
                          technology model, but the technology cannot be
                          removed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    !selectedTechnology && (
                      <div className="mt-5 rounded-[14px] border border-dashed border-champagne-gold/40 bg-warm-ivory/75 px-4 py-3 text-[10px] leading-5 text-slate-gray">
                        Technology has been removed. The base jewelry price is
                        currently shown.
                      </div>
                    )
                  )}
                </div>

                <div className="grid gap-3">
                  {!technologyRequired && (
                    <button
                      type="button"
                      onClick={handleRemoveTechnology}
                      className={`group relative overflow-hidden rounded-[18px] border p-4 text-left transition-all duration-300 sm:p-5 ${
                        !selectedTechnology
                          ? "border-classic-gold bg-midnight-navy text-soft-white shadow-[0_14px_32px_rgba(18,38,58,0.16)]"
                          : "border-light-champagne bg-warm-ivory/60 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-soft-white hover:shadow-[0_10px_25px_rgba(7,19,31,0.05)]"
                      }`}
                    >
                      <div className="relative flex items-center justify-between gap-4">
                        <div>
                          <h3
                            className={`text-[13px] font-semibold ${
                              !selectedTechnology
                                ? "text-soft-white"
                                : "text-midnight-navy"
                            }`}
                          >
                            Without Technology
                          </h3>

                          <p
                            className={`mt-1.5 text-[10px] ${
                              !selectedTechnology
                                ? "text-premium-silver/75"
                                : "text-slate-gray"
                            }`}
                          >
                            Remove the smart unit and pay the base jewelry
                            price.
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.12em] ${
                            !selectedTechnology
                              ? "bg-soft-white/10 text-champagne-gold"
                              : "bg-soft-cream text-antique-gold"
                          }`}
                        >
                          Base Price
                        </span>
                      </div>
                    </button>
                  )}

                  {productTechnologies.map(
                    (productTechnology, technologyIndex) => {
                      const technologyModel =
                        productTechnology.technologyModel || {};

                      const technology = technologyModel.technology || {};

                      const extraPrice = Number(
                        productTechnology.extraPrice ??
                          productTechnology.additionalPrice ??
                          0,
                      );

                      const isSelected =
                        selectedTechnology?._id === productTechnology._id;

                      return (
                        <button
                          type="button"
                          key={productTechnology._id}
                          onClick={() =>
                            handleTechnologyChange(productTechnology)
                          }
                          className={`group relative overflow-hidden rounded-[18px] border p-4 text-left transition-all duration-300 sm:p-5 ${
                            isSelected
                              ? "border-classic-gold bg-midnight-navy text-soft-white shadow-[0_14px_32px_rgba(18,38,58,0.16)]"
                              : "border-light-champagne bg-warm-ivory/60 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-soft-white hover:shadow-[0_10px_25px_rgba(7,19,31,0.05)]"
                          }`}
                        >
                          <div
                            className={`pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full blur-[45px] ${
                              isSelected
                                ? "bg-champagne-gold/15"
                                : "bg-soft-cream"
                            }`}
                          />

                          <div className="relative flex items-start justify-between gap-4">
                            <div>
                              <h3
                                className={`text-[13px] font-semibold ${
                                  isSelected
                                    ? "text-soft-white"
                                    : "text-midnight-navy"
                                }`}
                              >
                                {technology.name || "Technology"}
                              </h3>

                              {technologyModel.modelName && (
                                <p
                                  className={`mt-1.5 text-[11px] ${
                                    isSelected
                                      ? "text-premium-silver/75"
                                      : "text-slate-gray"
                                  }`}
                                >
                                  {technologyModel.modelName}
                                </p>
                              )}
                            </div>

                            <div className="shrink-0 text-right">
                              {technologyIndex === 0 && (
                                <span
                                  className={`mb-1.5 block text-[7px] font-semibold uppercase tracking-[0.12em] ${
                                    isSelected
                                      ? "text-premium-silver/65"
                                      : "text-steel-gray"
                                  }`}
                                >
                                  Default
                                </span>
                              )}

                              {extraPrice > 0 ? (
                                <span
                                  className={`text-[12px] font-semibold ${
                                    isSelected
                                      ? "text-champagne-gold"
                                      : "text-antique-gold"
                                  }`}
                                >
                                  +{formatMoney(extraPrice)} EGP
                                </span>
                              ) : (
                                <span
                                  className={`text-[10px] font-medium ${
                                    isSelected
                                      ? "text-premium-silver/70"
                                      : "text-slate-gray"
                                  }`}
                                >
                                  Included
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="relative mt-4 flex flex-wrap gap-2">
                            {technologyModel.requiresBattery && (
                              <span
                                className={`rounded-full px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.15em] ${
                                  isSelected
                                    ? "bg-soft-white/10 text-champagne-gold"
                                    : "bg-soft-cream text-antique-gold"
                                }`}
                              >
                                Battery
                              </span>
                            )}

                            {technologyModel.requiresActivation && (
                              <span
                                className={`rounded-full px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.15em] ${
                                  isSelected
                                    ? "bg-soft-white/10 text-champagne-gold"
                                    : "bg-soft-cream text-slate-gray"
                                }`}
                              >
                                Activation
                              </span>
                            )}

                            {technologyModel.requiresSubscription && (
                              <span
                                className={`rounded-full px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.15em] ${
                                  isSelected
                                    ? "bg-soft-white/10 text-champagne-gold"
                                    : "bg-soft-cream text-antique-gold"
                                }`}
                              >
                                Subscription
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {technologyRequired && productTechnologies.length === 0 && (
              <div className="mt-7 rounded-[20px] border border-red-200 bg-red-50 p-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-red-700">
                  Technology Configuration Required
                </p>

                <p className="mt-2 text-[10px] leading-6 text-red-600">
                  This product requires Smart Technology, but no selectable
                  technology option is currently available. Please contact us
                  before ordering this piece.
                </p>
              </div>
            )}

            {variants.length > 0 && (
              <div className="mt-7 rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_10px_32px_rgba(7,19,31,0.04)] backdrop-blur-sm sm:p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-midnight-navy text-[10px] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.14)]">
                          ✦
                        </span>

                        <h2 className="font-serif text-[1.45rem] font-normal text-midnight-navy">
                          Choose Your Variant
                        </h2>
                      </div>

                      <p className="ml-[54px] mt-1.5 text-[10px] text-steel-gray">
                        Select your preferred color and size.
                      </p>
                    </div>
                  </div>

                  {!selectedVariant && (
                    <div className="mt-5 rounded-[14px] border border-dashed border-champagne-gold/40 bg-warm-ivory/75 px-4 py-3 text-[10px] leading-5 text-slate-gray">
                      Please select your variant before adding the product to
                      your cart.
                    </div>
                  )}
                </div>

                {colors.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-[9px] font-semibold uppercase tracking-[0.18em] text-midnight-navy">
                        Color
                      </h3>

                      {selectedColor && (
                        <span className="text-[10px] text-slate-gray">
                          {selectedColor}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {colors.map((color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`min-h-[44px] rounded-full border px-5 text-[11px] font-medium transition-all duration-300 ${
                            selectedColor === color
                              ? "border-midnight-navy bg-midnight-navy text-soft-white shadow-[0_8px_20px_rgba(18,38,58,0.14)]"
                              : "border-light-champagne bg-warm-ivory/70 text-midnight-navy hover:border-classic-gold hover:bg-soft-white"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-[9px] font-semibold uppercase tracking-[0.18em] text-midnight-navy">
                        Size
                      </h3>

                      {selectedSize && (
                        <span className="text-[10px] text-slate-gray">
                          {selectedSize}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {sizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => handleSizeChange(size)}
                          className={`min-h-[44px] min-w-20 rounded-[12px] border px-5 text-[11px] font-medium transition-all duration-300 ${
                            selectedSize === size
                              ? "border-midnight-navy bg-midnight-navy text-soft-white shadow-[0_8px_20px_rgba(18,38,58,0.14)]"
                              : "border-light-champagne bg-warm-ivory/70 text-midnight-navy hover:border-classic-gold hover:bg-soft-white"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVariant && (
                  <div className="mt-6 rounded-[18px] border border-light-champagne/70 bg-warm-ivory/75 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-[9px] text-classic-gold">✦</span>

                      <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-antique-gold">
                        Selected Variant
                      </span>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {selectedVariant.sku && (
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.12em] text-steel-gray">
                            SKU
                          </span>

                          <p className="mt-1 text-[12px] font-semibold text-midnight-navy">
                            {selectedVariant.sku}
                          </p>
                        </div>
                      )}

                      {selectedVariant.material && (
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.12em] text-steel-gray">
                            Material
                          </span>

                          <p className="mt-1 text-[12px] font-semibold text-midnight-navy">
                            {selectedVariant.material}
                          </p>
                        </div>
                      )}

                      {selectedVariant.finish && (
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.12em] text-steel-gray">
                            Finish
                          </span>

                          <p className="mt-1 text-[12px] font-semibold text-midnight-navy">
                            {selectedVariant.finish}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-[9px] uppercase tracking-[0.12em] text-steel-gray">
                          Available Stock
                        </span>

                        <p className="mt-1 text-[12px] font-semibold text-midnight-navy">
                          {selectedVariant.stock}
                        </p>
                      </div>
                    </div>

                    {hasDiscount && (
                      <div className="mt-5 border-t border-light-champagne/80 pt-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[11px] font-semibold text-midnight-navy">
                            {formatMoney(currentPrice)} EGP
                          </span>

                          <span className="text-[10px] text-steel-gray line-through">
                            {formatMoney(comparePrice)} EGP
                          </span>

                          <span className="rounded-full bg-midnight-navy px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-champagne-gold">
                            {discountPercentage}% OFF
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {productTechnologies.length === 0 &&
              technologyModels.length > 0 && (
                <div className="mt-7 rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_10px_32px_rgba(7,19,31,0.04)] backdrop-blur-sm sm:p-6">
                  <h2 className="mb-5 font-serif text-[1.45rem] font-normal text-midnight-navy">
                    Technology Models
                  </h2>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {technologyModels.map((model) => (
                      <div
                        key={model._id}
                        className="rounded-[18px] border border-light-champagne bg-warm-ivory/60 p-5"
                      >
                        <h3 className="text-[12px] font-semibold text-midnight-navy">
                          {model.modelName}
                        </h3>

                        {model.technology?.name && (
                          <p className="mt-1.5 text-[10px] text-slate-gray">
                            {model.technology.name}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {model.requiresBattery && (
                            <span className="rounded-full bg-soft-cream px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-antique-gold">
                              Battery
                            </span>
                          )}

                          {model.requiresActivation && (
                            <span className="rounded-full bg-soft-cream px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-gray">
                              Activation
                            </span>
                          )}

                          {model.requiresSubscription && (
                            <span className="rounded-full bg-soft-cream px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-antique-gold">
                              Subscription
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="mt-7 rounded-[24px] border border-light-champagne/90 bg-soft-white/85 p-5 shadow-[0_10px_32px_rgba(7,19,31,0.04)] backdrop-blur-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-cream text-[11px] text-classic-gold">
                  ✦
                </span>

                <h2 className="font-serif text-[1.4rem] font-normal text-midnight-navy">
                  Product Specifications
                </h2>
              </div>

              <div className="divide-y divide-light-champagne/70">
                {product.material && (
                  <div className="flex justify-between gap-5 py-3.5">
                    <span className="text-[10px] text-steel-gray">
                      Material
                    </span>

                    <strong className="text-right text-[11px] font-semibold text-midnight-navy">
                      {product.material}
                    </strong>
                  </div>
                )}

                {product.color && (
                  <div className="flex justify-between gap-5 py-3.5">
                    <span className="text-[10px] text-steel-gray">Color</span>

                    <strong className="text-right text-[11px] font-semibold text-midnight-navy">
                      {product.color}
                    </strong>
                  </div>
                )}

                {product.weight > 0 && (
                  <div className="flex justify-between gap-5 py-3.5">
                    <span className="text-[10px] text-steel-gray">Weight</span>

                    <strong className="text-right text-[11px] font-semibold text-midnight-navy">
                      {product.weight} g
                    </strong>
                  </div>
                )}

                {product.sku && (
                  <div className="flex justify-between gap-5 py-3.5">
                    <span className="text-[10px] text-steel-gray">SKU</span>

                    <strong className="text-right text-[11px] font-semibold text-midnight-navy">
                      {selectedVariant?.sku || product.sku}
                    </strong>
                  </div>
                )}

                <div className="flex justify-between gap-5 py-3.5">
                  <span className="text-[10px] text-steel-gray">Stock</span>

                  <strong className="text-right text-[11px] font-semibold text-midnight-navy">
                    {currentStock}
                  </strong>
                </div>

                <div className="flex justify-between gap-5 py-3.5">
                  <span className="text-[10px] text-steel-gray">Status</span>

                  <strong className="text-right text-[11px] font-semibold capitalize text-midnight-navy">
                    {isOutOfStock ? "Out Of Stock" : product.status}
                  </strong>
                </div>
              </div>
            </div>

            {!isUnavailable && (
              <div className="mt-7">
                <h3 className="mb-3 text-[8px] font-semibold uppercase tracking-[0.22em] text-antique-gold">
                  Quantity
                </h3>

                <div className="flex w-fit items-center overflow-hidden rounded-full border border-light-champagne bg-soft-white shadow-[0_7px_20px_rgba(7,19,31,0.04)]">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="flex h-12 w-14 items-center justify-center text-lg text-midnight-navy transition-colors duration-300 hover:bg-soft-cream disabled:opacity-30"
                  >
                    −
                  </button>

                  <div className="flex h-12 min-w-14 items-center justify-center border-x border-light-champagne px-4 text-[12px] font-semibold text-midnight-navy">
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= currentStock}
                    className="flex h-12 w-14 items-center justify-center text-lg text-midnight-navy transition-colors duration-300 hover:bg-soft-cream disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mt-7">
              <button
                type="button"
                disabled={
                  isUnavailable ||
                  isCartLoading ||
                  (technologyRequired && !selectedTechnology)
                }
                onClick={handleAddToCart}
                className="group flex min-h-[58px] w-full items-center justify-center gap-4 rounded-[14px] bg-midnight-navy px-8 text-[10px] font-semibold uppercase tracking-[0.1em] text-soft-white shadow-[0_15px_35px_rgba(18,38,58,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_20px_42px_rgba(18,38,58,0.23)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {isCartLoading ? (
                  "Adding..."
                ) : isOutOfStock ? (
                  "Out Of Stock"
                ) : technologyRequired && !selectedTechnology ? (
                  "Technology Required"
                ) : (
                  <>
                    Add To Cart
                    <span className="text-[16px] text-champagne-gold transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                    <span className="font-serif text-[14px] font-normal text-champagne-gold">
                      {formatMoney(currentPrice)} EGP
                    </span>
                    {hasDiscount && (
                      <span className="text-[9px] font-normal text-premium-silver/55 line-through">
                        {formatMoney(comparePrice)} EGP
                      </span>
                    )}
                  </>
                )}
              </button>

              {addedToCart && (
                <div className="mt-3 rounded-[14px] border border-champagne-gold/30 bg-soft-cream px-4 py-3 text-center text-[10px] font-medium text-antique-gold">
                  Product added successfully.
                </div>
              )}
            </div>

            {product.description && (
              <div className="mt-10 border-t border-light-champagne pt-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/60" />

                  <h2 className="text-[8px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                    Description
                  </h2>
                </div>

                <p className="text-[13px] leading-8 text-slate-gray">
                  {product.description}
                </p>
              </div>
            )}

            {product.careInstructions && (
              <div className="mt-8 border-t border-light-champagne pt-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/60" />

                  <h2 className="text-[8px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                    Care Instructions
                  </h2>
                </div>

                <p className="text-[13px] leading-8 text-slate-gray">
                  {product.careInstructions}
                </p>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div className="mt-8 border-t border-light-champagne pt-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/60" />

                  <h2 className="text-[8px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                    Tags
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-light-champagne bg-soft-white px-4 py-2 text-[9px] font-medium text-slate-gray shadow-[0_4px_12px_rgba(7,19,31,0.025)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.preparationDays > 0 && (
              <div className="mt-8 rounded-[20px] border border-champagne-gold/30 bg-soft-cream/80 p-5">
                <h3 className="font-serif text-[1.2rem] font-normal text-midnight-navy">
                  Preparation Time
                </h3>

                <p className="mt-2 text-[11px] leading-6 text-slate-gray">
                  Estimated preparation:
                  <strong className="ml-1 font-semibold text-antique-gold">
                    {product.preparationDays} day(s)
                  </strong>
                </p>
              </div>
            )}

            {product.isCustomizable && (
              <div className="mt-7 rounded-[20px] border border-champagne-gold/30 bg-soft-cream/80 p-5">
                <h3 className="font-serif text-[1.2rem] font-normal text-midnight-navy">
                  ✨ Customizable Product
                </h3>

                <p className="mt-2 text-[11px] leading-6 text-slate-gray">
                  This product can be customized before manufacturing.
                </p>
              </div>
            )}

            {product.seoDescription && (
              <div className="relative mt-8 overflow-hidden rounded-[24px] bg-midnight-navy p-6 text-soft-white shadow-[0_18px_45px_rgba(18,38,58,0.18)]">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-champagne-gold/10 blur-[55px]" />

                <div className="relative flex items-center gap-3">
                  <span className="text-[10px] text-champagne-gold">✦</span>

                  <h2 className="font-serif text-[1.35rem] font-normal">
                    About This Product
                  </h2>
                </div>

                <p className="relative mt-4 text-[12px] leading-7 text-premium-silver/75">
                  {product.seoDescription}
                </p>
              </div>
            )}

            <Link
              to="/shop"
              className="group mt-9 inline-flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-antique-gold transition-colors duration-300 hover:text-midnight-navy"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailsPage;
