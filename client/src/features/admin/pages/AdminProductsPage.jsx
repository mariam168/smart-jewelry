import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { getProducts, deleteProduct } from "../services/productApi";

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

      setError(error?.response?.data?.message || "Failed to load products.");
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
        previous.filter((product) => product._id !== productId),
      );
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Delete failed.");
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
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-champagne-gold/10 blur-[40px]" />

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
                className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.14em] text-midnight-navy underline decoration-classic-gold/50 underline-offset-4 transition-colors duration-300 hover:text-antique-gold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="relative mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold/50 hover:shadow-[0_18px_40px_rgba(7,19,31,0.07)]">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-soft-cream blur-[50px]" />

              <div className="relative flex items-center justify-between">
                <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                  Total Products
                </p>

                <span className="text-[8px] text-classic-gold">✦</span>
              </div>

              <p className="relative mt-5 font-serif text-[2.6rem] font-normal leading-none tracking-[-0.03em] text-midnight-navy">
                {products.length}
              </p>

              <div className="relative mt-5 flex items-center gap-2">
                <span className="h-px w-6 bg-classic-gold/45" />
                <span className="h-px flex-1 bg-light-champagne" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold/50 hover:shadow-[0_18px_40px_rgba(7,19,31,0.07)]">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-soft-cream blur-[50px]" />

              <div className="relative flex items-center justify-between">
                <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                  Active Products
                </p>

                <span className="text-[8px] text-classic-gold">✦</span>
              </div>

              <p className="relative mt-5 font-serif text-[2.6rem] font-normal leading-none tracking-[-0.03em] text-midnight-navy">
                {
                  products.filter((product) => product.status === "active")
                    .length
                }
              </p>

              <div className="relative mt-5 flex items-center gap-2">
                <span className="h-px w-6 bg-classic-gold/45" />
                <span className="h-px flex-1 bg-light-champagne" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[22px] border border-light-champagne/90 bg-soft-white/85 p-6 shadow-[0_10px_30px_rgba(7,19,31,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold/50 hover:shadow-[0_18px_40px_rgba(7,19,31,0.07)]">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-soft-cream blur-[50px]" />

              <div className="relative flex items-center justify-between">
                <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-steel-gray">
                  Out of Stock
                </p>

                <span className="text-[8px] text-classic-gold">✦</span>
              </div>

              <p className="relative mt-5 font-serif text-[2.6rem] font-normal leading-none tracking-[-0.03em] text-midnight-navy">
                {
                  products.filter((product) => Number(product.stock || 0) <= 0)
                    .length
                }
              </p>

              <div className="relative mt-5 flex items-center gap-2">
                <span className="h-px w-6 bg-classic-gold/45" />
                <span className="h-px flex-1 bg-light-champagne" />
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/80 px-6 py-28 text-center shadow-[0_14px_40px_rgba(7,19,31,0.04)] backdrop-blur-sm">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[90px]" />

            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy shadow-[0_10px_25px_rgba(18,38,58,0.14)]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/25 border-t-champagne-gold" />

              <span className="absolute text-[6px] text-champagne-gold">✦</span>
            </div>

            <p className="relative text-[8px] font-semibold uppercase tracking-[0.3em] text-steel-gray">
              Loading Collection
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="relative overflow-hidden rounded-[28px] border border-champagne-gold/15 bg-midnight-navy px-6 py-24 text-center shadow-[0_28px_70px_rgba(7,19,31,0.17)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rich-navy via-midnight-navy to-luxury-black" />

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-champagne-gold/12" />

            <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full border border-champagne-gold/10" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne-gold/[0.08] blur-[90px]" />

            <div className="relative z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-soft-white/[0.05] text-[17px] text-champagne-gold shadow-[0_12px_28px_rgba(0,0,0,0.13)]">
                ✦
              </div>

              <p className="mt-7 text-[8px] font-semibold uppercase tracking-[0.34em] text-champagne-gold">
                Your Collection
              </p>

              <h2 className="mt-4 font-serif text-[2.2rem] font-normal tracking-[-0.03em] text-soft-white">
                No products yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-[12px] leading-7 text-premium-silver/70">
                Begin building your collection by adding your first jewelry
                piece.
              </p>

              <Link
                to="/admin/products/new"
                className="group mt-8 inline-flex min-h-[50px] items-center justify-center gap-7 rounded-[13px] bg-soft-white px-7 text-[9px] font-semibold uppercase tracking-[0.11em] text-midnight-navy shadow-[0_14px_32px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warm-ivory"
              >
                Add Your First Product
                <span className="text-[15px] text-classic-gold transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_55px_rgba(7,19,31,0.055)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-soft-cream blur-[80px]" />

            <div className="relative flex flex-col gap-5 border-b border-light-champagne/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="h-px w-8 bg-classic-gold/60" />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                    Collection
                  </span>

                  <span className="text-[7px] text-classic-gold">✦</span>
                </div>

                <h2 className="font-serif text-[1.65rem] font-normal tracking-[-0.025em] text-midnight-navy">
                  All Products
                </h2>

                <p className="mt-1.5 text-[10px] text-slate-gray">
                  {products.length} product
                  {products.length !== 1 ? "s" : ""} in your collection
                </p>
              </div>

              <Link
                to="/admin/products/new"
                className="group inline-flex min-h-[42px] w-fit items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-warm-ivory/75 px-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-midnight-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-soft-white"
              >
                <span className="text-[14px] text-classic-gold">+</span>
                New Product
              </Link>
            </div>

            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[1200px]">
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
                      Price
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
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="group transition-colors duration-300 hover:bg-warm-ivory/55"
                    >
                      <td className="px-6 py-5">
                        <div className="flex min-w-[300px] items-center gap-4">
                          {product.image ? (
                            <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[16px] border border-light-champagne/80 bg-soft-cream shadow-[0_5px_16px_rgba(7,19,31,0.03)]">
                              <img
                                src={`http://localhost:5000${product.image}`}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-600 group-hover:scale-105"
                              />

                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-luxury-black/10 to-transparent" />
                            </div>
                          ) : (
                            <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-[16px] border border-light-champagne/80 bg-soft-cream text-[10px] text-classic-gold">
                              ✦
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-serif text-[1.05rem] font-normal text-midnight-navy">
                              {product.name}
                            </p>

                            {product.shortDescription ? (
                              <p className="mt-1 max-w-[260px] truncate text-[9px] leading-5 text-slate-gray">
                                {product.shortDescription}
                              </p>
                            ) : (
                              <p className="mt-1 text-[9px] text-steel-gray">
                                No description
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
                        {product.category?.name ? (
                          <span className="inline-flex rounded-full border border-champagne-gold/25 bg-warm-ivory/80 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-antique-gold">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-[9px] text-steel-gray">
                            No Category
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {product.technologyModels?.length > 0 ? (
                          <div className="flex max-w-[230px] flex-wrap gap-1.5">
                            {product.technologyModels
                              .slice(0, 3)
                              .map((model) => (
                                <span
                                  key={model._id}
                                  className="rounded-full border border-light-champagne bg-soft-cream/80 px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.07em] text-slate-gray"
                                >
                                  {model.modelName}
                                </span>
                              ))}

                            {product.technologyModels.length > 3 && (
                              <span className="rounded-full bg-midnight-navy px-2.5 py-1.5 text-[7px] font-semibold text-champagne-gold">
                                +{product.technologyModels.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] text-steel-gray">
                            None
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div>
                          <p className="font-serif text-[1rem] font-normal text-midnight-navy">
                            {product.price}{" "}
                            <span className="font-sans text-[7px] font-semibold uppercase text-slate-gray">
                              EGP
                            </span>
                          </p>

                          {product.comparePrice > 0 &&
                            product.comparePrice > product.price && (
                              <p className="mt-1 text-[9px] text-steel-gray line-through">
                                {product.comparePrice} EGP
                              </p>
                            )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`relative flex h-2 w-2 items-center justify-center ${
                              Number(product.stock || 0) > 0
                                ? "text-classic-gold"
                                : "text-antique-gold"
                            }`}
                          >
                            <span
                              className={`absolute h-2 w-2 rounded-full ${
                                Number(product.stock || 0) > 0
                                  ? "bg-classic-gold"
                                  : "bg-antique-gold"
                              }`}
                            />
                          </span>

                          <span
                            className={`text-[10px] font-semibold ${
                              Number(product.stock || 0) > 0
                                ? "text-midnight-navy"
                                : "text-antique-gold"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase tracking-[0.1em] ${
                            product.status === "active"
                              ? "border-champagne-gold/25 bg-soft-cream text-antique-gold"
                              : "border-antique-gold/20 bg-warm-ivory text-slate-gray"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              product.status === "active"
                                ? "bg-classic-gold"
                                : "bg-steel-gray"
                            }`}
                          />

                          {product.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product._id}/variants`}
                            className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-light-champagne bg-soft-white px-3.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                          >
                            Variants
                          </Link>

                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-light-champagne bg-soft-white px-3.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-antique-gold/20 bg-soft-white px-3.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-antique-gold transition-all duration-300 hover:-translate-y-0.5 hover:border-antique-gold/40 hover:bg-soft-cream hover:text-midnight-navy"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="relative flex items-center justify-center gap-3 border-t border-light-champagne/70 px-6 py-4">
              <span className="h-px w-8 bg-classic-gold/30" />

              <span className="text-[7px] text-classic-gold">✦</span>

              <span className="h-px w-8 bg-classic-gold/30" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductsPage;
