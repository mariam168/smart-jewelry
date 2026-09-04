import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { createSmartUnit } from "../services/smartUnitApi";

import { getTechnologyModels } from "../../services/technologyModelApi";

const AddSmartUnitPage = () => {
  const navigate = useNavigate();

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
    const loadTechnologyModels = async () => {
      try {
        setIsLoading(true);

        setError("");

        const response = await getTechnologyModels();

        const models =
          response?.data?.technologyModels || response?.technologyModels || [];

        setTechnologyModels(Array.isArray(models) ? models : []);
      } catch (error) {
        console.error("LOAD TECHNOLOGY MODELS ERROR:", error);

        setError(
          error?.response?.data?.message || "Failed to load Technology Models.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadTechnologyModels();
  }, []);

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
      await createSmartUnit({
        ...formData,

        costPrice: Number(formData.costPrice) || 0,

        stock: Number(formData.stock) || 0,
      });

      navigate("/admin/smart-units");
    } catch (error) {
      console.error("CREATE SMART UNIT ERROR:", error);

      console.error("STATUS:", error?.response?.status);

      console.error("RESPONSE:", error?.response?.data);

      setError(
        error?.response?.data?.message ||
          "Failed to create Smart Unit. Please check your data.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-warm-ivory
      "
      >
        <div
          className="
          text-center
        "
        >
          <div
            className="
            mx-auto
            h-8
            w-8
            animate-spin
            rounded-full
            border-2
            border-light-champagne
            border-t-classic-gold
          "
          />

          <p
            className="
            mt-4
            text-[13px]
            text-slate-gray
          "
          >
            Loading Technology Models...
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-[14px] border border-light-champagne bg-warm-ivory/50 px-4 py-3.5 text-[13px] text-midnight-navy outline-none transition placeholder:text-steel-gray focus:border-classic-gold focus:bg-soft-white focus:ring-4 focus:ring-classic-gold/10";

  const labelClass = "mb-2 block text-[11px] font-semibold text-slate-gray";
  return (
    <div
      className="
min-h-screen
bg-warm-ivory
text-midnight-navy
"
    >
      <header
        className="
border-b
border-light-champagne
bg-soft-white/80
"
      >
        <div
          className="
mx-auto
flex
max-w-6xl
items-center
justify-between
px-6
py-6
"
        >
          <div>
            <div
              className="
flex
items-center
gap-2
text-[12px]
text-slate-gray
"
            >
              <Link
                to="/admin/smart-units"
                className="
hover:text-antique-gold
"
              >
                Smart Units
              </Link>

              <span>/</span>

              <span>Add</span>
            </div>

            <h1
              className="
mt-3
font-serif
text-[2.4rem]
tracking-[-0.04em]
"
            >
              Add Smart Unit
            </h1>

            <p
              className="
mt-2
text-[13px]
text-slate-gray
"
            >
              Create Smart Unit and generate physical inventory
            </p>
          </div>

          <Link
            to="/admin/smart-units"
            className="
rounded-[12px]
border
border-light-champagne
bg-soft-white
px-5
py-3
text-[11px]
font-semibold
text-slate-gray
"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main
        className="
mx-auto
max-w-6xl
px-6
py-10
"
      >
        {error && (
          <div
            className="
mb-6
rounded-[16px]
border
border-red-200
bg-red-50
px-5
py-4
text-[13px]
text-red-700
"
          >
            ⚠️
            <span className="ml-2">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="
grid
grid-cols-1
gap-6
lg:grid-cols-3
"
          >
            <div
              className="
space-y-6
lg:col-span-2
"
            >
              <section
                className="
overflow-hidden
rounded-[24px]
border
border-light-champagne
bg-soft-white
"
              >
                <div
                  className="
border-b
border-light-champagne
bg-warm-ivory/40
px-6
py-5
"
                >
                  <h2
                    className="
font-serif
text-[1.45rem]
"
                  >
                    Basic Information
                  </h2>
                </div>

                <div
                  className="
space-y-6
p-6
"
                >
                  <div>
                    <label className={labelClass}>Name</label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Smart Unit name"
                      className={inputClass}
                    />

                    <p
                      className="
mt-2
text-[11px]
text-slate-gray
"
                    >
                      Multiple units with the same name are allowed.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Description</label>

                    <textarea
                      rows="4"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Description..."
                      className={`

${inputClass}

resize-none

`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Technology Model</label>

                    <select
                      name="technologyModel"
                      value={formData.technologyModel}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Select Technology Model</option>

                      {technologyModels.map((technology) => (
                        <option key={technology._id} value={technology._id}>
                          {technology.modelName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section
                className="
overflow-hidden
rounded-[24px]
border
border-light-champagne
bg-soft-white
"
              >
                <div
                  className="
border-b
border-light-champagne
bg-warm-ivory/40
px-6
py-5
"
                >
                  <h2
                    className="
font-serif
text-[1.45rem]
"
                  >
                    Inventory Information
                  </h2>
                </div>

                <div
                  className="
grid
grid-cols-1
gap-6
p-6
md:grid-cols-2
"
                >
                  <div>
                    <label className={labelClass}>Cost Price</label>

                    <input
                      type="number"
                      min="0"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Initial Stock</label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                      className={inputClass}
                    />

                    <p
                      className="
mt-2
text-[11px]
text-slate-gray
"
                    >
                      This creates physical serial units automatically.
                    </p>
                  </div>

                  <div
                    className="
md:col-span-2
"
                  >
                  <label className={labelClass}>
  Production Date
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

              <section
                className="
overflow-hidden
rounded-[24px]
border
border-light-champagne
bg-soft-white
"
              >
                <div
                  className="
border-b
border-light-champagne
bg-warm-ivory/40
px-6
py-5
"
                >
                  <h2
                    className="
font-serif
text-[1.45rem]
"
                  >
                    Additional Information
                  </h2>
                </div>

                <div
                  className="
space-y-6
p-6
"
                >
                  <div>
                    <label className={labelClass}>Manufacturer</label>

                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="Manufacturer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Notes</label>

                    <textarea
                      rows="4"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Internal notes..."
                      className={`
${inputClass}
resize-none
`}
                    />
                  </div>
                </div>
              </section>
            </div>

            <div>
              <section
                className="
overflow-hidden
rounded-[24px]
border
border-light-champagne
bg-soft-white
"
              >
                <div
                  className="
border-b
border-light-champagne
bg-warm-ivory/40
px-6
py-5
"
                >
                  <h2
                    className="
font-serif
text-[1.4rem]
"
                  >
                    Status
                  </h2>
                </div>

                <div
                  className="
p-6
"
                >
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="available">Available</option>

                    <option value="reserved">Reserved</option>

                    <option value="assigned">Assigned</option>

                    <option value="activated">Activated</option>

                    <option value="inactive">Inactive</option>

                    <option value="damaged">Damaged</option>
                  </select>
                </div>
              </section>
            </div>
          </div>

          <div
            className="
mt-6
flex
justify-end
gap-3
rounded-[20px]
border
border-light-champagne
bg-soft-white
p-5
"
          >
            <Link
              to="/admin/smart-units"
              className="
rounded-[12px]
border
border-light-champagne
px-6
py-3
text-[11px]
font-semibold
text-slate-gray
"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="
rounded-[12px]
bg-midnight-navy
px-7
py-3
text-[11px]
font-semibold
text-white
disabled:opacity-50
"
            >
              {isSaving ? "Creating..." : "Create Smart Unit"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddSmartUnitPage;
