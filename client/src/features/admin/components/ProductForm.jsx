
import { useState } from "react";

const initialValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  thumbnail: "",
  images: "",
  brand: "Smart Jewelry",

  isActive: true,
  isFeatured: false,

  technologyType: "none",
  technologyEnabled: false,
  activationRequired: false,
  digitalProfileSupported: false,

  variants: [
    {
      sku: "",
      name: "",
      color: "",
      size: "",
      material: "",
      finish: "",
      price: "",
      stock: "",
      isActive: true,
    },
  ],
};

const ProductForm = ({
  onSubmit,
  isLoading = false,
}) => {
  const [
    formValues,
    setFormValues,
  ] = useState(initialValues);

  const [
    error,
    setError,
  ] = useState("");

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormValues(
      (previousValues) => ({
        ...previousValues,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };

  const handleVariantChange = (
    index,
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormValues(
      (previousValues) => {
        const updatedVariants = [
          ...previousValues.variants,
        ];

        updatedVariants[index] = {
          ...updatedVariants[index],

          [name]:
            type === "checkbox"
              ? checked
              : value,
        };

        return {
          ...previousValues,
          variants:
            updatedVariants,
        };
      }
    );
  };

  const addVariant = () => {
    setFormValues(
      (previousValues) => ({
        ...previousValues,

        variants: [
          ...previousValues.variants,

          {
            sku: "",
            name: "",
            color: "",
            size: "",
            material: "",
            finish: "",
            price: "",
            stock: "",
            isActive: true,
          },
        ],
      })
    );
  };

  const removeVariant = (
    index
  ) => {
    setFormValues(
      (previousValues) => ({
        ...previousValues,

        variants:
          previousValues.variants.filter(
            (_, variantIndex) =>
              variantIndex !== index
          ),
      })
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!formValues.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!formValues.slug.trim()) {
      setError(
        "Product slug is required."
      );
      return;
    }

    if (!formValues.category.trim()) {
      setError(
        "Category ID is required."
      );
      return;
    }

    if (
      formValues.variants.length ===
      0
    ) {
      setError(
        "At least one product variant is required."
      );
      return;
    }

    for (
      const variant of formValues.variants
    ) {
      if (
        !variant.sku ||
        !variant.price ||
        variant.stock === ""
      ) {
        setError(
          "Please complete SKU, price, and stock for every variant."
        );
        return;
      }
    }

    const productData = {
      name:
        formValues.name.trim(),

      slug:
        formValues.slug.trim(),

      shortDescription:
        formValues.shortDescription.trim(),

      description:
        formValues.description.trim(),

      category:
        formValues.category.trim(),

      brand:
        formValues.brand.trim(),

      thumbnail:
        formValues.thumbnail.trim(),

      images:
        formValues.images
          .split(",")
          .map(
            (image) =>
              image.trim()
          )
          .filter(Boolean),

      isActive:
        formValues.isActive,

      isFeatured:
        formValues.isFeatured,

      technology: {
        type:
          formValues.technologyType,

        enabled:
          formValues.technologyEnabled,

        activationRequired:
          formValues.activationRequired,

        digitalProfileSupported:
          formValues.digitalProfileSupported,
      },

      variants:
        formValues.variants.map(
          (variant) => ({
            sku:
              variant.sku.trim(),

            name:
              variant.name.trim(),

            color:
              variant.color.trim(),

            size:
              variant.size.trim(),

            material:
              variant.material.trim(),

            finish:
              variant.finish.trim(),

            price:
              Number(
                variant.price
              ),

            stock:
              Number(
                variant.stock
              ),

            isActive:
              variant.isActive,
          })
        ),
    };

    await onSubmit(
      productData
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Basic Information */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">

        <h2 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">

          <div>
            <label className="text-sm font-medium text-gray-700">
              Product Name
            </label>

            <input
              name="name"
              value={
                formValues.name
              }
              onChange={
                handleChange
              }
              placeholder="Smart NFC Bracelet"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Slug
            </label>

            <input
              name="slug"
              value={
                formValues.slug
              }
              onChange={
                handleChange
              }
              placeholder="smart-nfc-bracelet"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Brand
            </label>

            <input
              name="brand"
              value={
                formValues.brand
              }
              onChange={
                handleChange
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Category ID
            </label>

            <input
              name="category"
              value={
                formValues.category
              }
              onChange={
                handleChange
              }
              placeholder="MongoDB Category ID"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

        </div>

        <div className="mt-5">

          <label className="text-sm font-medium text-gray-700">
            Short Description
          </label>

          <input
            name="shortDescription"
            value={
              formValues.shortDescription
            }
            onChange={
              handleChange
            }
            placeholder="Elegant smart bracelet with NFC technology."
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

        </div>

        <div className="mt-5">

          <label className="text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            name="description"
            rows="5"
            value={
              formValues.description
            }
            onChange={
              handleChange
            }
            placeholder="Write a detailed product description..."
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

        </div>

      </section>


      {/* Images */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">

        <h2 className="text-lg font-semibold text-gray-900">
          Product Images
        </h2>

        <div className="mt-6 space-y-5">

          <div>

            <label className="text-sm font-medium text-gray-700">
              Thumbnail URL
            </label>

            <input
              name="thumbnail"
              value={
                formValues.thumbnail
              }
              onChange={
                handleChange
              }
              placeholder="https://example.com/image.jpg"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

          </div>

          <div>

            <label className="text-sm font-medium text-gray-700">
              Additional Images
            </label>

            <input
              name="images"
              value={
                formValues.images
              }
              onChange={
                handleChange
              }
              placeholder="URL 1, URL 2, URL 3"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <p className="mt-2 text-xs text-gray-500">
              Separate multiple image URLs with commas.
            </p>

          </div>

        </div>

      </section>


      {/* Smart Technology */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">

        <h2 className="text-lg font-semibold text-gray-900">
          Smart Technology
        </h2>

        <div className="mt-6">

          <label className="text-sm font-medium text-gray-700">
            Technology Type
          </label>

          <select
            name="technologyType"
            value={
              formValues.technologyType
            }
            onChange={
              handleChange
            }
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black sm:max-w-md"
          >
            <option value="none">
              None
            </option>

            <option value="nfc">
              NFC
            </option>

          </select>

        </div>

        <div className="mt-6 space-y-4">

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              name="technologyEnabled"
              checked={
                formValues.technologyEnabled
              }
              onChange={
                handleChange
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-gray-700">
              Enable Smart Technology
            </span>

          </label>

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              name="activationRequired"
              checked={
                formValues.activationRequired
              }
              onChange={
                handleChange
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-gray-700">
              Activation Required
            </span>

          </label>

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              name="digitalProfileSupported"
              checked={
                formValues.digitalProfileSupported
              }
              onChange={
                handleChange
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-gray-700">
              Supports Digital Profile
            </span>

          </label>

        </div>

      </section>


      {/* Variants */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Product Variants
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add different colors, sizes, prices, and stock.
            </p>

          </div>

          <button
            type="button"
            onClick={
              addVariant
            }
            className="rounded-lg border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white"
          >
            Add Variant
          </button>

        </div>


        <div className="mt-6 space-y-6">

          {formValues.variants.map(
            (
              variant,
              index
            ) => (

              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-5"
              >

                <div className="flex items-center justify-between">

                  <h3 className="font-medium text-gray-900">
                    Variant {index + 1}
                  </h3>

                  {formValues.variants
                    .length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeVariant(
                          index
                        )
                      }
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  )}

                </div>


                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  {[
                    {
                      name: "sku",
                      label: "SKU",
                    },
                    {
                      name: "name",
                      label: "Variant Name",
                    },
                    {
                      name: "color",
                      label: "Color",
                    },
                    {
                      name: "size",
                      label: "Size",
                    },
                    {
                      name: "material",
                      label: "Material",
                    },
                    {
                      name: "finish",
                      label: "Finish",
                    },
                    {
                      name: "price",
                      label: "Price",
                      type: "number",
                    },
                    {
                      name: "stock",
                      label: "Stock",
                      type: "number",
                    },
                  ].map(
                    (field) => (

                      <div
                        key={
                          field.name
                        }
                      >

                        <label className="text-sm font-medium text-gray-700">
                          {
                            field.label
                          }
                        </label>

                        <input
                          name={
                            field.name
                          }
                          type={
                            field.type ||
                            "text"
                          }
                          value={
                            variant[
                              field.name
                            ]
                          }
                          onChange={(
                            event
                          ) =>
                            handleVariantChange(
                              index,
                              event
                            )
                          }
                          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                        />

                      </div>

                    )
                  )}

                </div>


                <label className="mt-5 flex items-center gap-3">

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={
                      variant.isActive
                    }
                    onChange={(
                      event
                    ) =>
                      handleVariantChange(
                        index,
                        event
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm text-gray-700">
                    Variant is active
                  </span>

                </label>

              </div>

            )
          )}

        </div>

      </section>


      {/* Status */}

      <section className="rounded-xl border border-gray-200 bg-white p-6">

        <h2 className="text-lg font-semibold text-gray-900">
          Product Status
        </h2>

        <div className="mt-5 space-y-4">

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              name="isActive"
              checked={
                formValues.isActive
              }
              onChange={
                handleChange
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-gray-700">
              Product is active
            </span>

          </label>

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              name="isFeatured"
              checked={
                formValues.isFeatured
              }
              onChange={
                handleChange
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-gray-700">
              Featured product
            </span>

          </label>

        </div>

      </section>


      {/* Submit */}

      <div className="flex justify-end">

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-black px-8 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? "Creating Product..."
            : "Create Product"}
        </button>

      </div>

    </form>
  );
};

export default ProductForm;
