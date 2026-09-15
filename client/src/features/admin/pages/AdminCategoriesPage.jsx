
import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
  getCategories,
  deleteCategory,
} from "../services/categoryApi";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../auth/context/AuthContext.jsx";

const getBackendOrigin = () => {
  const baseURL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  return baseURL.replace(/\/api\/?$/, "");
};

const getFilePath = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value.url ||
      value.path ||
      value.secure_url ||
      ""
    );
  }

  return "";
};

const getImageUrl = (image) => {
  const filePath = getFilePath(image);

  if (!filePath) {
    return "";
  }

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  const origin = getBackendOrigin();

  return `${origin}${
    filePath.startsWith("/") ? "" : "/"
  }${filePath}`;
};

const getLocalizedValue = (value, fallback = "") => {
  if (!value) {
    return fallback;
  }

  if (typeof value === "object") {
    return (
      value.en ||
      value.ar ||
      fallback
    );
  }

  return String(value);
};

const AdminCategoriesPage = () => {
  const { t } = useTranslation();

  const { user } = useAuth();

  const isSuperAdmin =
    user?.role?.name === "super_admin";

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // =========================
  // Load Categories
  // =========================

  const loadCategories = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await getCategories();

      const data =
        response?.data ||
        response?.categories ||
        response ||
        [];

      setCategories(
        Array.isArray(data)
          ? data
          : data?.categories || [],
      );
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          t("adminCategories.failedToLoadCategories"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // =========================
  // Delete Category
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      t("adminCategories.deleteConfirmation"),
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(id);

      setError("");

      setSuccess("");

      await deleteCategory(id);

      setCategories((prev) =>
        prev.filter(
          (category) =>
            category._id !== id &&
            category.id !== id,
        ),
      );

      setSuccess(
        t("adminCategories.categoryDeletedSuccessfully"),
      );
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          t("adminCategories.failedToDeleteCategory"),
      );
    } finally {
      setDeleting(null);
    }
  };

  const filteredCategories = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) => {
      const searchableValues = [
        category.name?.en,
        category.name?.ar,
        category.description?.en,
        category.description?.ar,
        category.slug,
        getLocalizedValue(category.name),
        getLocalizedValue(category.description),
      ];

      return searchableValues.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [categories, searchTerm]);

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4"
              >
                <div className="h-16 w-16 animate-pulse rounded-lg bg-gray-200" />

                <div className="flex-1">
                  <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />

                  <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
                </div>

                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // Render
  // =========================

  return (
    <div className="p-6">
      {/* Header */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("adminCategories.categories")}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {t("adminCategories.manageProductCategories")}
          </p>
        </div>

        <Link
          to="/admin/categories/new"
          className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + {t("adminCategories.addCategory")}
        </Link>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Empty State */}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
            📂
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            {t("adminCategories.noCategoriesFound")}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {t("adminCategories.createFirstCategory")}
          </p>

          <Link
            to="/admin/categories/new"
            className="mt-5 inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {t("adminCategories.addCategory")}
          </Link>
        </div>
      ) : (
        /* Categories List */

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {t("adminCategories.categories")}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {searchTerm.trim()
                    ? `${filteredCategories.length} ${t(
                        "adminCategories.searchResults",
                      )}`
                    : `${categories.length} ${
                        categories.length === 1
                          ? t("adminCategories.category")
                          : t("adminCategories.categories")
                      }`}
                </p>
              </div>

              <div className="relative w-full lg:w-[340px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder={t(
                    "adminCategories.searchPlaceholder",
                  )}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                  ⌕
                </span>
              </div>
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                ⌕
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                {t("adminCategories.noMatchingCategories")}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {t(
                  "adminCategories.noMatchingCategoriesDescription",
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t("adminCategories.category")}
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t("adminCategories.slug")}
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t("adminCategories.description")}
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t("adminCategories.products")}
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t("adminCategories.actions")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredCategories.map((category) => {
                    const categoryId =
                      category._id || category.id;

                    const categoryName =
                      getLocalizedValue(
                        category.name,
                        t("adminCategories.unnamedCategory"),
                      );

                    const categoryDescription =
                      getLocalizedValue(
                        category.description,
                        t("adminCategories.noDescription"),
                      );

                    const imageUrl =
                      getImageUrl(
                        category.image,
                      );

                    const productCount =
                      category.productCount ??
                      category.productsCount ??
                      category.products?.length ??
                      0;

                    return (
                      <tr
                        key={categoryId}
                        className="transition hover:bg-gray-50"
                      >
                        {/* Category */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={categoryName}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xl text-gray-400">
                                📂
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-900">
                                {categoryName}
                              </p>

                              {/* Arabic name */}

                              {category.name?.ar && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {category.name.ar}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Slug */}

                        <td className="px-6 py-4">
                          <span className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-700">
                            {category.slug || "-"}
                          </span>
                        </td>

                        {/* Description */}

                        <td className="max-w-xs px-6 py-4">
                          <div>
                            <p className="line-clamp-2 text-sm text-gray-600">
                              {categoryDescription}
                            </p>

                            {/* Arabic description */}

                            {category.description?.ar && (
                              <p
                                className="mt-1 line-clamp-2 text-sm text-gray-400"
                                dir="rtl"
                              >
                                {category.description.ar}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Product Count */}

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700">
                            {productCount}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/categories/${categoryId}/edit`}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              {t("adminCategories.edit")}
                            </Link>

                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    categoryId,
                                  )
                                }
                                disabled={
                                  deleting ===
                                  categoryId
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deleting ===
                                categoryId
                                  ? t(
                                      "adminCategories.deleting",
                                    )
                                  : t(
                                      "adminCategories.delete",
                                    )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
