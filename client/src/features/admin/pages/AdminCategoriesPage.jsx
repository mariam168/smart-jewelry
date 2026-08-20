import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { getCategories, deleteCategory } from "../services/categoryApi";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const API_BASE_URL = "http://localhost:5000";

  const loadCategories = async () => {
    try {
      setIsLoading(true);

      setError("");

      const response = await getCategories();

      const categoriesData =
        response?.data?.categories || response?.categories || [];

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load categories.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_BASE_URL}${image}`;
    }

    return `${API_BASE_URL}/${image}`;
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(categoryId);

      setError("");

      setSuccess("");

      await deleteCategory(categoryId);

      setCategories((previousCategories) =>
        previousCategories.filter((category) => category._id !== categoryId),
      );

      setSuccess("Category deleted successfully.");
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete category.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
        <div className="pointer-events-none fixed -right-48 top-10 h-[500px] w-[500px] rounded-full bg-champagne-gold/[0.05] blur-[130px]" />

        <div className="pointer-events-none fixed -left-44 bottom-0 h-[460px] w-[460px] rounded-full bg-light-champagne/55 blur-[120px]" />

        <header className="relative border-b border-light-champagne/80 bg-soft-white/60 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1360px] items-center justify-between px-6 py-7 sm:px-8 lg:px-10">
            <div>
              <h1 className="font-serif text-[2.3rem] font-normal leading-none tracking-[-0.035em] text-midnight-navy">
                Categories
              </h1>

              <p className="mt-2 text-[11px] text-slate-gray">
                Manage your product categories
              </p>
            </div>

            <div className="h-11 w-32 animate-pulse rounded-[13px] bg-light-champagne/80" />
          </div>
        </header>

        <main className="relative mx-auto max-w-[1360px] px-6 py-10 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_14px_42px_rgba(7,19,31,0.045)] backdrop-blur-sm">
            <div className="animate-pulse">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-6 border-b border-light-champagne/65 px-6 py-5 last:border-b-0"
                >
                  <div className="h-16 w-16 rounded-[14px] bg-light-champagne/80" />

                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-40 rounded bg-light-champagne/80" />

                    <div className="h-3 w-64 rounded bg-soft-cream" />
                  </div>

                  <div className="h-9 w-20 rounded-[11px] bg-light-champagne/80" />

                  <div className="h-9 w-20 rounded-[11px] bg-light-champagne/80" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -right-52 top-20 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <div className="pointer-events-none fixed -left-44 bottom-0 h-[460px] w-[460px] rounded-full bg-light-champagne/50 blur-[120px]" />

      <header className="sticky top-0 z-30 border-b border-light-champagne/80 bg-soft-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-6 py-5 sm:px-8 lg:px-10">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-[11px] font-semibold text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.13)]">
                C
              </div>

              <div>
                <h1 className="font-serif text-[2rem] font-normal leading-none tracking-[-0.03em] text-midnight-navy">
                  Categories
                </h1>

                <p className="mt-2 text-[10px] text-slate-gray">
                  Manage your product categories
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/admin/categories/new"
            className="group inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-soft-white shadow-[0_10px_24px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_14px_30px_rgba(18,38,58,0.2)]"
          >
            <span className="text-[16px] font-light leading-none text-champagne-gold">
              +
            </span>
            Add Category
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1360px] px-6 py-10 sm:px-8 lg:px-10">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 p-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-midnight-navy font-semibold text-champagne-gold">
              !
            </div>

            <div className="flex-1">{error}</div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-antique-gold/60 transition-colors duration-300 hover:text-midnight-navy"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-[16px] border border-classic-gold/25 bg-soft-cream/85 p-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-midnight-navy font-semibold text-champagne-gold">
              ✓
            </div>

            <span>{success}</span>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-7 bg-classic-gold/60" />
            </div>

            <h2 className="font-serif text-[1.6rem] font-normal tracking-[-0.025em] text-midnight-navy">
              All Categories
            </h2>

            <p className="mt-1.5 text-[10px] text-slate-gray">
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </p>
          </div>

          <Link
            to="/admin/categories/new"
            className="group inline-flex min-h-[42px] w-fit items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/80 px-4 text-[8px] font-semibold uppercase tracking-[0.1em] text-midnight-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory"
          >
            <span className="text-[14px] text-classic-gold">+</span>
            New Category
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 px-6 py-16 text-center shadow-[0_14px_42px_rgba(7,19,31,0.045)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-champagne-gold/10" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full border border-champagne-gold/[0.08]" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[90px]" />

            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[20px] border border-champagne-gold/25 bg-warm-ivory text-[1.4rem] font-serif text-antique-gold shadow-[0_8px_22px_rgba(7,19,31,0.04)]">
                C
              </div>

              <h2 className="mt-6 font-serif text-[1.9rem] font-normal tracking-[-0.025em] text-midnight-navy">
                No Categories Found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-[11px] leading-6 text-slate-gray">
                You don't have any product categories yet. Create your first
                category to start organizing your products.
              </p>

              <Link
                to="/admin/categories/new"
                className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-6 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_10px_24px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy"
              >
                <span className="text-[15px] text-champagne-gold">+</span>
                Add Category
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[26px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_16px_50px_rgba(7,19,31,0.05)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-soft-cream blur-[75px]" />

            <div className="relative hidden border-b border-light-champagne/80 bg-warm-ivory/55 px-6 py-4 lg:grid lg:grid-cols-[100px_1.2fr_2fr_100px_220px] lg:items-center lg:gap-5">
              <div className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                Image
              </div>

              <div className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                Category
              </div>

              <div className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                Description
              </div>

              <div className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                Products
              </div>

              <div className="text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                Actions
              </div>
            </div>

            <div className="relative divide-y divide-light-champagne/65">
              {categories.map((category) => {
                const imageUrl = getImageUrl(category.image);

                const productCount = category.productCount ?? 0;

                const isDeleting = deletingId === category._id;

                return (
                  <div
                    key={category._id}
                    className="group px-6 py-5 transition-colors duration-300 hover:bg-warm-ivory/55"
                  >
                    <div className="hidden lg:grid lg:grid-cols-[100px_1.2fr_2fr_100px_220px] lg:items-center lg:gap-5">
                      <div>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="h-16 w-16 rounded-[14px] border border-light-champagne/80 bg-soft-cream object-cover shadow-[0_5px_16px_rgba(7,19,31,0.035)] transition-transform duration-300 group-hover:scale-[1.03]"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";

                              event.currentTarget.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}

                        <div
                          className={`${
                            imageUrl ? "hidden" : "flex"
                          } h-16 w-16 items-center justify-center rounded-[14px] border border-light-champagne/80 bg-soft-cream text-[8px] font-medium text-steel-gray`}
                        >
                          No Image
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-[1.05rem] font-normal text-midnight-navy">
                          {category.name}
                        </h3>

                        {category.slug && (
                          <p className="mt-1 truncate text-[8px] text-steel-gray">
                            /{category.slug}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[10px] leading-5 text-slate-gray">
                          {category.description || "No description provided."}
                        </p>
                      </div>

                      <div>
                        <span className="inline-flex min-w-[40px] items-center justify-center rounded-full border border-light-champagne bg-warm-ivory/80 px-3 py-2 text-[9px] font-semibold text-midnight-navy">
                          {productCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/categories/${category._id}/edit`}
                          className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-light-champagne bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(category._id)}
                          className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-antique-gold/20 bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-antique-gold transition-all duration-300 hover:-translate-y-0.5 hover:border-antique-gold/40 hover:bg-soft-cream hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-5 lg:hidden">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={category.name}
                              className="h-20 w-20 rounded-[16px] border border-light-champagne/80 bg-soft-cream object-cover shadow-[0_5px_16px_rgba(7,19,31,0.035)]"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";

                                event.currentTarget.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}

                          <div
                            className={`${
                              imageUrl ? "hidden" : "flex"
                            } h-20 w-20 items-center justify-center rounded-[16px] border border-light-champagne/80 bg-soft-cream text-[8px] font-medium text-steel-gray`}
                          >
                            No Image
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-[1.25rem] font-normal text-midnight-navy">
                            {category.name}
                          </h3>

                          {category.slug && (
                            <p className="mt-1 text-[8px] text-steel-gray">
                              /{category.slug}
                            </p>
                          )}

                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-light-champagne bg-warm-ivory/80 px-3 py-1.5">
                            <span className="text-[8px] text-slate-gray">
                              Products:
                            </span>

                            <span className="text-[9px] font-semibold text-midnight-navy">
                              {productCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] leading-6 text-slate-gray">
                          {category.description || "No description provided."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Link
                          to={`/admin/categories/${category._id}/edit`}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] border border-light-champagne bg-soft-white px-4 text-[8px] font-semibold uppercase tracking-[0.1em] text-midnight-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory"
                        >
                          Edit Category
                        </Link>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(category._id)}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[12px] border border-antique-gold/20 bg-soft-white px-4 text-[8px] font-semibold uppercase tracking-[0.1em] text-antique-gold transition-all duration-300 hover:-translate-y-0.5 hover:border-antique-gold/40 hover:bg-soft-cream hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          {isDeleting ? "Deleting..." : "Delete Category"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCategoriesPage;
