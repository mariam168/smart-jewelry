import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getTechnologyModels,
  deleteTechnologyModel,
} from "../services/technologyModelApi";

const getImageUrl = (image) => {
  if (!image) return "";

  let imagePath = String(image).trim();

  const backendUrl = (
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  if (
    /^https?:\/\/localhost:5000/i.test(imagePath) ||
    /^https?:\/\/127\.0\.0\.1:5000/i.test(imagePath)
  ) {
    imagePath = imagePath.replace(
      /^https?:\/\/(?:localhost|127\.0\.0\.1):5000/i,
      "",
    );
  } else if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith("/api/uploads/")) {
    imagePath = imagePath.replace(/^\/api/, "");
  }

  if (!imagePath.startsWith("/")) {
    imagePath = `/${imagePath}`;
  }

  return `${backendUrl}${imagePath}`;
};

const AdminTechnologyModelsPage = () => {
  const [technologyModels, setTechnologyModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTechnologyModels = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getTechnologyModels();

      setTechnologyModels(response.data?.technologyModels || []);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to load technology models.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTechnologyModels();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this technology model?",
    );

    if (!confirmed) return;

    try {
      await deleteTechnologyModel(id);

      setTechnologyModels((previous) =>
        previous.filter((item) => item._id !== id),
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete technology model.",
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-warm-ivory text-midnight-navy">
      <div className="pointer-events-none fixed -right-52 top-20 h-[520px] w-[520px] rounded-full bg-champagne-gold/[0.06] blur-[130px]" />

      <div className="pointer-events-none fixed -left-44 bottom-0 h-[460px] w-[460px] rounded-full bg-light-champagne/50 blur-[120px]" />

      <header className="relative border-b border-light-champagne/80 bg-soft-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1420px] flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-classic-gold/60" />

              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-antique-gold">
                Smart Jewelry
              </span>
            </div>

            <h1 className="font-serif text-[2.6rem] font-normal leading-none tracking-[-0.04em] text-midnight-navy sm:text-[3.1rem]">
              Technology Models
            </h1>

            <p className="mt-4 max-w-xl text-[12px] leading-7 text-slate-gray sm:text-[13px]">
              Manage the technology models used across your smart jewelry
              collection.
            </p>
          </div>

          <Link
            to="/admin/technology-models/new"
            className="inline-flex min-h-[50px] w-fit shrink-0 items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-6 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white shadow-[0_12px_28px_rgba(18,38,58,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rich-navy hover:shadow-[0_16px_35px_rgba(18,38,58,0.20)]"
          >
            <span className="text-[10px] text-champagne-gold">
              ✦
            </span>

            Add Technology Model
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1420px] px-6 py-10 sm:px-8 lg:px-10">
        {error && (
          <div className="mb-7 rounded-[16px] border border-antique-gold/25 bg-soft-cream/85 px-5 py-4 text-[10px] leading-5 text-antique-gold shadow-[0_7px_20px_rgba(7,19,31,0.03)]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 px-6 py-24 text-center shadow-[0_18px_50px_rgba(7,19,31,0.05)] backdrop-blur-sm">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-cream blur-[100px]" />

            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-midnight-navy shadow-[0_12px_28px_rgba(18,38,58,0.14)]">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-champagne-gold/20 border-t-champagne-gold" />
            </div>

            <p className="relative text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-gray">
              Loading Technology Models...
            </p>
          </div>
        ) : technologyModels.length === 0 ? (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 px-6 py-16 text-center shadow-[0_18px_50px_rgba(7,19,31,0.05)] backdrop-blur-sm">
            <div className="relative z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-[17px] text-classic-gold">
                ✦
              </div>

              <h2 className="mt-6 font-serif text-[2rem] font-normal text-midnight-navy">
                No Technology Models Found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-[11px] leading-6 text-slate-gray">
                Create your first technology model.
              </p>

              <Link
                to="/admin/technology-models/new"
                className="mt-7 inline-flex min-h-[50px] items-center justify-center gap-3 rounded-[13px] bg-midnight-navy px-7 text-[8px] font-semibold uppercase tracking-[0.11em] text-soft-white"
              >
                <span className="text-champagne-gold">
                  ✦
                </span>

                Add Technology Model
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[28px] border border-light-champagne/90 bg-soft-white/85 shadow-[0_18px_55px_rgba(7,19,31,0.055)] backdrop-blur-sm">
            <div className="relative z-10 flex flex-col gap-5 border-b border-light-champagne/80 px-7 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-champagne-gold/25 bg-warm-ivory text-classic-gold">
                  ✦
                </div>

                <div>
                  <p className="text-[7px] font-semibold uppercase tracking-[0.24em] text-antique-gold">
                    Technology Collection
                  </p>

                  <h2 className="mt-1.5 font-serif text-[1.5rem] font-normal text-midnight-navy">
                    Technology Models
                  </h2>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-light-champagne bg-warm-ivory/80 px-4 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-classic-gold" />

                <span className="text-[8px] font-semibold uppercase tracking-[0.09em] text-slate-gray">
                  {technologyModels.length}{" "}
                  {technologyModels.length === 1 ? "Model" : "Models"}
                </span>
              </div>
            </div>

            <div className="relative z-10 overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead className="border-b border-light-champagne/80 bg-warm-ivory/55">
                  <tr>
                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Image
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Technology
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Model Name
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Model Code
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Manufacturer
                    </th>

                    <th className="px-6 py-4 text-center text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Battery
                    </th>

                    <th className="px-6 py-4 text-center text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Activation
                    </th>

                    <th className="px-6 py-4 text-center text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Subscription
                    </th>

                    <th className="px-6 py-4 text-center text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-[7px] font-semibold uppercase tracking-[0.18em] text-steel-gray">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-champagne/65">
                  {technologyModels.map((model) => (
                    <tr
                      key={model._id}
                      className="group transition-colors duration-300 hover:bg-warm-ivory/55"
                    >
                      <td className="px-6 py-5">
                        {model.image ? (
                          <div className="relative h-16 w-16 overflow-hidden rounded-[15px] border border-light-champagne/80 bg-soft-cream">
                            <img
                              src={getImageUrl(model.image)}
                              alt={model.modelName}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-[15px] border border-light-champagne/80 bg-soft-cream text-[8px] text-steel-gray">
                            No Image
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="inline-flex items-center rounded-full border border-champagne-gold/25 bg-warm-ivory/80 px-3 py-1.5">
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-classic-gold" />

                          <span className="text-[8px] font-semibold uppercase text-antique-gold">
                            {model.technology?.name || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-serif text-[1rem] text-midnight-navy">
                          {model.modelName}
                        </p>

                        {model.description && (
                          <p className="mt-1 max-w-[220px] truncate text-[8px] text-slate-gray">
                            {model.description}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full border border-light-champagne bg-warm-ivory/80 px-3 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-gray">
                          {model.modelCode}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-[9px] text-slate-gray">
                          {model.manufacturer || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        {model.requiresBattery ? "✓" : "—"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        {model.requiresActivation ? "✓" : "—"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        {model.requiresSubscription ? "✓" : "—"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[7px] font-semibold uppercase ${
                            model.status === "active"
                              ? "border-classic-gold/25 bg-soft-cream text-antique-gold"
                              : "border-antique-gold/20 bg-warm-ivory text-antique-gold"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              model.status === "active"
                                ? "bg-classic-gold"
                                : "bg-antique-gold"
                            }`}
                          />

                          {model.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/technology-models/${model._id}/edit`}
                            className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-light-champagne bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-gray transition-all hover:border-champagne-gold hover:bg-warm-ivory"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(model._id)}
                            className="inline-flex min-h-[36px] items-center justify-center rounded-full border border-antique-gold/20 bg-soft-white px-4 text-[7px] font-semibold uppercase tracking-[0.1em] text-antique-gold transition-all hover:bg-soft-cream"
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
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTechnologyModelsPage;