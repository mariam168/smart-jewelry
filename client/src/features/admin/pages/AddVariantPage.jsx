import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { createVariant, uploadImage } from "../services/productApi";

const AddVariantPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    color: "",
    size: "",
    material: "",
    finish: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    isActive: true,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setIsLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        const form = new FormData();

        form.append("image", image);

        const upload = await uploadImage(form);

        imageUrl = upload.image;
      }

      await createVariant({
        product: id,

        sku: formData.sku,

        name: formData.name,

        color: formData.color,

        size: formData.size,

        material: formData.material,

        finish: formData.finish,

        price: Number(formData.price),

        compareAtPrice: Number(formData.compareAtPrice),

        stock: Number(formData.stock),

        image: imageUrl,

        isActive: formData.isActive,
      });

      navigate(`/admin/products/${id}/variants`);
    } catch (error) {
      console.log(error);

      setError(error?.response?.data?.message || "Failed to create variant.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -left-48 top-24 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[135px]" />

      <div className="pointer-events-none fixed -right-48 bottom-0 h-[500px] w-[500px] rounded-full bg-light-champagne/60 blur-[130px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/65 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                Product Management
              </span>
            </div>

            <h1 className="font-serif text-[2.5rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3rem]">
              Add Variant
            </h1>

            <p className="mt-4 text-[11px] leading-6 text-slate-gray sm:text-[12px]">
              Create a new variation for this product.
            </p>
          </div>

          <Link
            to={`/admin/products/${id}/variants`}
            className="group inline-flex min-h-[46px] w-fit shrink-0 items-center justify-center gap-3 rounded-full border border-champagne-gold/30 bg-soft-white/85 px-5 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray shadow-[0_7px_18px_rgba(7,19,31,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
          >
            <span className="text-[14px] text-classic-gold transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1240px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_22px_70px_rgba(7,19,31,0.06)] backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-champagne-gold/10" />

          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-champagne-gold/[0.07]" />

          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full border border-champagne-gold/[0.08]" />

          <div className="pointer-events-none absolute right-1/3 top-1/3 h-72 w-72 rounded-full bg-soft-cream blur-[100px]" />

          <div className="relative z-10 border-b border-light-champagne/80 bg-warm-ivory/45 px-7 py-7 sm:px-10 lg:px-12">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-[12px] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.13)]">
                ✦
              </div>

              <div>
                <h2 className="font-serif text-[1.45rem] font-normal tracking-[-0.02em] text-midnight-navy">
                  Variant Details
                </h2>

                <p className="mt-1.5 text-[10px] leading-5 text-slate-gray">
                  Add the information and specifications for this variant.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative z-10 space-y-10 px-7 py-9 sm:px-10 lg:px-12"
          >
            {error && (
              <div className="rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.025)]">
                {error}
              </div>
            )}

            <section>
              <div className="mb-6">
                <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                  Basic Information
                </p>

                <div className="mt-3 h-px w-full bg-light-champagne/80" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    SKU
                    <span className="ml-1 text-antique-gold">*</span>
                  </label>

                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    placeholder="e.g. RING-GOLD-001"
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Variant Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Classic Gold Ring"
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Color
                  </label>

                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Gold"
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Size
                  </label>

                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="Medium"
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6">
                <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                  Specifications
                </p>

                <div className="mt-3 h-px w-full bg-light-champagne/80" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Material
                  </label>

                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    placeholder="18K Gold"
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Finish
                  </label>

                  <input
                    type="text"
                    name="finish"
                    value={formData.finish}
                    onChange={handleChange}
                    placeholder="Polished"
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6">
                <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                  Pricing & Inventory
                </p>

                <div className="mt-3 h-px w-full bg-light-champagne/80" />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Price
                    <span className="ml-1 text-antique-gold">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="0"
                      className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 pr-16 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />

                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[7px] font-semibold uppercase tracking-[0.1em] text-antique-gold">
                      EGP
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Compare Price
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      name="compareAtPrice"
                      value={formData.compareAtPrice}
                      onChange={handleChange}
                      placeholder="0"
                      className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 pr-16 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                    />

                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[7px] font-semibold uppercase tracking-[0.1em] text-antique-gold">
                      EGP
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Stock
                    <span className="ml-1 text-antique-gold">*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    className="h-[54px] w-full rounded-[14px] border border-light-champagne bg-warm-ivory/60 px-5 text-[12px] text-midnight-navy outline-none transition-all duration-300 placeholder:text-steel-gray/65 hover:border-champagne-gold/55 hover:bg-soft-white focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6">
                <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-antique-gold">
                  Product Image
                </p>

                <div className="mt-3 h-px w-full bg-light-champagne/80" />
              </div>

              <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Variant Image
                  </label>

                  <label className="group relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-champagne-gold/35 bg-warm-ivory/55 px-6 py-8 text-center transition-all duration-300 hover:border-champagne-gold/70 hover:bg-soft-white">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-champagne-gold/[0.06] blur-[50px]" />

                    <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy text-[17px] text-champagne-gold shadow-[0_8px_20px_rgba(18,38,58,0.12)] transition-transform duration-300 group-hover:-translate-y-1">
                      ↑
                    </div>

                    <p className="relative text-[10px] font-semibold uppercase tracking-[0.1em] text-midnight-navy">
                      Choose an image
                    </p>

                    <p className="relative mt-2 text-[9px] text-steel-gray">
                      PNG, JPG or WEBP
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-midnight-navy">
                    Preview
                  </p>

                  <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-[18px] border border-light-champagne bg-soft-cream shadow-[0_8px_22px_rgba(7,19,31,0.035)]">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-[17px] text-classic-gold">✦</div>

                        <p className="mt-2 text-[7px] font-semibold uppercase tracking-[0.2em] text-steel-gray">
                          No Image
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="rounded-[18px] border border-light-champagne/90 bg-warm-ivory/60 p-5">
                <label className="flex cursor-pointer items-center justify-between gap-5">
                  <div>
                    <p className="text-[11px] font-semibold text-midnight-navy">
                      Active Variant
                    </p>

                    <p className="mt-1.5 text-[9px] leading-5 text-steel-gray">
                      Make this variant available for customers.
                    </p>
                  </div>

                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="peer sr-only"
                    />

                    <div className="h-7 w-12 rounded-full bg-premium-silver transition-colors duration-300 peer-checked:bg-midnight-navy" />

                    <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-soft-white shadow-[0_2px_8px_rgba(7,19,31,0.18)] transition-transform duration-300 peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-light-champagne/80 pt-8 sm:flex-row sm:justify-end">
              <Link
                to={`/admin/products/${id}/variants`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-light-champagne bg-soft-white px-8 text-[8px] font-semibold uppercase tracking-[0.11em] text-slate-gray transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:bg-warm-ivory hover:text-midnight-navy"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex min-h-[48px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-8 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_11px_26px_rgba(18,38,58,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_15px_32px_rgba(18,38,58,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? "Saving..." : "Create Variant"}

                {!isLoading && (
                  <span className="text-[12px] text-champagne-gold transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddVariantPage;
