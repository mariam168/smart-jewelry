import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { getSmartUnit, updateSmartUnit } from "../services/smartUnitApi";

import { getTechnologyModels } from "../../services/technologyModelApi";

const EditSmartUnitPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const [technologyModels, setTechnologyModels] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    technologyModel: "",
    costPrice: "",
    stock: "",
    productionDate: "",
    manufacturer: "",
    notes: "",
    status: "available",
  });

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [smartUnitResponse, technologyResponse] = await Promise.all([
          getSmartUnit(id),
          getTechnologyModels(),
        ]);

        const smartUnit =
          smartUnitResponse?.data?.smartUnit || smartUnitResponse?.smartUnit;

        const models =
          technologyResponse?.data?.technologyModels ||
          technologyResponse?.technologyModels ||
          [];

        setTechnologyModels(Array.isArray(models) ? models : []);

        setFormData({
          name: smartUnit?.name || "",

          description: smartUnit?.description || "",

          technologyModel: smartUnit?.technologyModel?._id || "",

          costPrice: smartUnit?.costPrice ?? "",

          stock: smartUnit?.stock ?? "",

          productionDate: smartUnit?.productionDate
            ? smartUnit.productionDate.substring(0, 10)
            : "",

          manufacturer: smartUnit?.manufacturer || "",

          notes: smartUnit?.notes || "",

          status: smartUnit?.status || "available",
        });
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            t("editSmartUnit.failedToLoadSmartUnit"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    try {
      await updateSmartUnit(id, {
        ...formData,

        costPrice: Number(formData.costPrice),

        stock: Number(formData.stock),
      });

      navigate("/admin/smart-units");
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          t("editSmartUnit.failedToUpdateSmartUnit"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-ivory">
        <div>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-light-champagne border-t-classic-gold" />

          <p className="mt-4 text-[13px] text-slate-gray">
            {t("editSmartUnit.loadingSmartUnit")}
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-[14px] border border-light-champagne bg-warm-ivory/50 px-4 py-3.5 text-[13px] text-midnight-navy outline-none transition placeholder:text-steel-gray focus:border-classic-gold focus:ring-4 focus:ring-classic-gold/10";

  const labelClass = "mb-2 block text-[11px] font-semibold text-slate-gray";

  return (
    <div className="min-h-screen bg-warm-ivory text-midnight-navy">
      <header className="border-b border-light-champagne bg-soft-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-slate-gray">
              <Link to="/admin/smart-units">
                {t("editSmartUnit.smartUnits")}
              </Link>

              <span>/</span>

              <span>{t("editSmartUnit.edit")}</span>
            </div>

            <h1 className="mt-3 font-serif text-[2.4rem] tracking-[-0.04em]">
              {t("editSmartUnit.editSmartUnit")}
            </h1>

            <p className="mt-2 text-[13px] text-slate-gray">
              {t("editSmartUnit.updateSmartUnitDescription")}
            </p>
          </div>

          <Link
            to="/admin/smart-units"
            className="rounded-[12px] border border-light-champagne bg-soft-white px-5 py-3 text-[11px] font-semibold text-slate-gray"
          >
            {t("editSmartUnit.back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-[24px] border border-light-champagne bg-soft-white">
                <div className="border-b border-light-champagne px-6 py-5">
                  <h2 className="font-serif text-[1.45rem]">
                    {t("editSmartUnit.basicInformation")}
                  </h2>
                </div>

                <div className="space-y-6 p-6">
                  <div>
                    <label className={labelClass}>
                      {t("editSmartUnit.name")}
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      {t("editSmartUnit.description")}
                    </label>

                    <textarea
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      {t("editSmartUnit.technologyModel")}
                    </label>

                    <select
                      name="technologyModel"
                      value={formData.technologyModel}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">
                        {t("editSmartUnit.selectTechnologyModel")}
                      </option>

                      {technologyModels.map((technology) => (
                        <option key={technology._id} value={technology._id}>
                          {technology.modelName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-light-champagne bg-soft-white">
                <div className="border-b border-light-champagne px-6 py-5">
                  <h2 className="font-serif text-[1.45rem]">
                    {t("editSmartUnit.inventoryInformation")}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      {t("editSmartUnit.costPrice")}
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      {t("editSmartUnit.stock")}
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      {t("editSmartUnit.productionDate")}
                    </label>

                    <input
                      type="date"
                      name="productionDate"
                      value={formData.productionDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-light-champagne bg-soft-white">
                <div className="space-y-6 p-6">
                  <div>
                    <label className={labelClass}>
                      {t("editSmartUnit.manufacturer")}
                    </label>

                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      {t("editSmartUnit.notes")}
                    </label>

                    <textarea
                      rows={4}
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </section>
            </div>

            <section className="h-fit rounded-[24px] border border-light-champagne bg-soft-white p-6">
              <label className={labelClass}>
                {t("editSmartUnit.status")}
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="available">
                  {t("editSmartUnit.statuses.available")}
                </option>

                <option value="reserved">
                  {t("editSmartUnit.statuses.reserved")}
                </option>

                <option value="assigned">
                  {t("editSmartUnit.statuses.assigned")}
                </option>

                <option value="activated">
                  {t("editSmartUnit.statuses.activated")}
                </option>

                <option value="inactive">
                  {t("editSmartUnit.statuses.inactive")}
                </option>

                <option value="damaged">
                  {t("editSmartUnit.statuses.damaged")}
                </option>
              </select>
            </section>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Link
              to="/admin/smart-units"
              className="rounded-[12px] border border-light-champagne px-6 py-3 text-[11px]"
            >
              {t("editSmartUnit.cancel")}
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-[12px] bg-midnight-navy px-7 py-3 text-[11px] font-semibold text-soft-white disabled:opacity-50"
            >
              {isSaving
                ? t("editSmartUnit.updating")
                : t("editSmartUnit.updateSmartUnit")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditSmartUnitPage;