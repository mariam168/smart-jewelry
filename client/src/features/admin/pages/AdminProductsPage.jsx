import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getProducts,
  deleteProduct,
} from "../services/productApi";

const getBackendOrigin = () => {
  const explicitBackend =
    import.meta.env.VITE_BACKEND_URL;

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

const BACKEND_URL = getBackendOrigin();

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

  if (image.startsWith("/api/uploads/")) {
    image = image.replace(/^\/api/, "");
  }

  return `${BACKEND_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getProducts();

      setProducts(response.data?.products || []);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      await deleteProduct(productId);

      setProducts((previous) =>
        previous.filter(
          (product) => product._id !== productId,
        ),
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Delete failed.",
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-48 top-24 h-[500px] w-[500px] rounded-full bg-light-champagne/55 blur-[130px]" />

      <div className="pointer-events-none fixed -right-52 top-[420px] h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/55 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-[13px] text-champagne-gold shadow-[0_9px_22px_rgba(18,38,58,0.14)]">
              ✦
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="h-px w-6 bg-classic-gold/55" />

                <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                  Administration
                </p>
              </div>

              <h1 className="font-serif text-[2.2rem] font-normal leading-none tracking-[-0.035em] text-midnight-navy sm:text-[2.6rem]">
                Products
              </h1>

              <p className="mt-2 text-[11px] text-slate-gray sm:text-[12px]">
                Manage your jewelry collection
              </p>
            </div>
          </div>

          <Link
            to="/admin/products/new"
            className="group inline-flex min-h-[50px] w-fit items-center justify-center gap-4 rounded-[13px] bg-midnight-navy px-6 text-[9px] font-semibold uppercase tracking-[0.12em] text-soft-white shadow-[0_12px_28px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_16px_35px_rgba(18,38,58,0.20)]"
          >
            <span className="text-[18px] font-light leading-none text-champagne-gold">
              +
            </span>

            Add Product
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1500px] px-6 py-10 sm:px-8 lg:px-10">
        {error && (
          <div className="relative mb-7 overflow-hidden rounded-[18px] border border-antique-gold/25 bg-soft-cream/80 px-5 py-4 shadow-[0_8px_24px_rgba(7,19,31,0.035)]">
            <div className="relative flex items-center justify-between gap-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-midnight-navy text-[11px] text-champagne-gold">
                  !
                </span>

                <span className="text-[11px] leading-5 text-antique-gold">
                  {error}
                </span>
              </div>

              <button
                type="button"
                onClick={loadProducts}
                className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy underline decoration-classic-gold/50 underline-offset-4"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="relative mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)]">
              <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                Total Products
              </p>

              <p className="mt-5 font-serif text-[2.6rem] text-midnight-navy">
                {products.length}
              </p>
            </div>

            <div className="rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)]">
              <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                Active Products
              </p>

              <p className="mt-5 font-serif text-[2.6rem] text-midnight-navy">
                {
                  products.filter(
                    (product) =>
                      product.status === "active",
                  ).length
                }
              </p>
            </div>

            <div className="rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)]">
              <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                Out of Stock
              </p>

              <p className="mt-5 font-serif text-[2.6rem] text-midnight-navy">
                {
                  products.filter(
                    (product) =>
                      Number(product.stock || 0) <= 0,
                  ).length
                }
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/80 px-6 py-28 text-center">
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/25 border-t-champagne-gold" />
            </div>

            <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
              Loading Collection
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="relative overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-midnight-navy px-6 py-24 text-center">
            <div className="relative z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 text-[17px] text-champagne-gold">
                ✦
              </div>

              <h2 className="mt-7 font-serif text-[2.2rem] text-soft-white">
                No products yet
              </h2>

              <Link
                to="/admin/products/new"
                className="mt-8 inline-flex min-h-[50px] items-center justify-center rounded-[13px] bg-soft-white px-7 text-[9px] font-semibold uppercase text-midnight-navy"
              >
                Add Your First Product
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_55px_rgba(7,19,31,0.055)]">
            <div className="relative flex flex-col gap-5 border-b border-light-champagne/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/60" />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                    Collection
                  </span>
                </div>

                <h2 className="font-serif text-[1.65rem] text-midnight-navy">
                  All Products
                </h2>
              </div>

              <Link
                to="/admin/products/new"
                className="inline-flex min-h-[42px] items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-warm-ivory/75 px-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-midnight-navy"
              >
                <span className="text-[14px] text-classic-gold">
                  +
                </span>

                New Product
              </Link>
            </div>

            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[1320px]">
                <thead>
                  <tr className="border-b border-light-champagne/80 bg-warm-ivory/55">
                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                      Technology
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                      Selling Price
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                      Product Cost
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[7px] font-semibold uppercase tracking-[0.22em] text-steel-gray">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-champagne/65">
                  {products.map((product) => {
                    const productImage =
                      product.primaryImage ||
                      product.image ||
                      product.images?.[0] ||
                      "";

                    const productImageUrl =
                      getImageUrl(productImage);

                    return (
                      <tr
                        key={product._id}
                        className="group transition-colors duration-300 hover:bg-warm-ivory/55"
                      >
                        <td className="px-6 py-5">
                          <div className="flex min-w-[300px] items-center gap-4">
                            {productImageUrl ? (
                              <div className="h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[16px] border border-light-champagne/80 bg-soft-cream">
                                <img
                                  src={productImageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-[16px] border border-light-champagne/80 bg-soft-cream text-classic-gold">
                                ✦
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-serif text-[1.05rem] text-midnight-navy">
                                {product.name}
                              </p>

                              {product.shortDescription && (
                                <p className="mt-1 max-w-[260px] truncate text-[9px] text-slate-gray">
                                  {product.shortDescription}
                                </p>
                              )}

                              {product.sku && (
                                <p className="mt-2 text-[7px] font-semibold uppercase tracking-[0.17em] text-antique-gold">
                                  SKU · {product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {product.category?.name ||
                            "No Category"}
                        </td>

                        <td className="px-6 py-5">
                          {product.technologyModels?.length >
                          0 ? (
                            <div className="flex max-w-[230px] flex-wrap gap-1.5">
                              {product.technologyModels
                                .slice(0, 3)
                                .map((model) => (
                                  <span
                                    key={model._id}
                                    className="rounded-full border border-light-champagne bg-soft-cream px-2.5 py-1.5 text-[7px] text-slate-gray"
                                  >
                                    {model.modelName}
                                  </span>
                                ))}
                            </div>
                          ) : (
                            <span className="text-[9px] text-steel-gray">
                              None
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-serif text-[1rem] text-midnight-navy">
                            {Number(
                              product.price || 0,
                            ).toLocaleString()}{" "}
                            <span className="font-sans text-[7px] text-slate-gray">
                              EGP
                            </span>
                          </p>

                          {product.comparePrice > 0 &&
                            product.comparePrice >
                              product.price && (
                              <p className="mt-1 text-[9px] text-steel-gray line-through">
                                {Number(
                                  product.comparePrice,
                                ).toLocaleString()}{" "}
                                EGP
                              </p>
                            )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="rounded-[12px] border border-champagne-gold/20 bg-soft-cream/70 px-3 py-2">
                            <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-steel-gray">
                              Cost
                            </p>

                            <p className="mt-1 font-serif text-[1rem] text-antique-gold">
                              {Number(
                                product.costPrice || 0,
                              ).toLocaleString()}{" "}
                              <span className="font-sans text-[7px] text-slate-gray">
                                EGP
                              </span>
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-[10px] font-semibold text-midnight-navy">
                            {product.stock}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.1em] ${
                              product.status === "active"
                                ? "border-champagne-gold/25 bg-soft-cream text-antique-gold"
                                : "border-antique-gold/20 bg-warm-ivory text-slate-gray"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/products/${product._id}/variants`}
                              className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-light-champagne bg-soft-white px-3.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray"
                            >
                              Variants
                            </Link>

                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-light-champagne bg-soft-white px-3.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(product._id)
                              }
                              className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-antique-gold/20 bg-soft-white px-3.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-antique-gold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductsPage;