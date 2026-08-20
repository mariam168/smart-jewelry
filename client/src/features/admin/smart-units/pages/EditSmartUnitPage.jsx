import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getSmartUnit,
  updateSmartUnit,
} from "../services/smartUnitApi";

import {
  getTechnologyModels,
} from "../../services/technologyModelApi";


const EditSmartUnitPage = () => {

  const { id } = useParams();

  const navigate = useNavigate();


  // ==========================
  // State
  // ==========================

  const [technologyModels, setTechnologyModels] =
    useState([]);

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      technologyModel: "",
      serialNumber: "",
      costPrice: "",
      stock: "",
      firmwareVersion: "",
      manufacturer: "",
      notes: "",
      status: "available",
    });


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    isSaving,
    setIsSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================
  // Load Data
  // ==========================

  useEffect(() => {

    const loadData = async () => {

      try {

        const [
          smartUnitResponse,
          technologyResponse,
        ] = await Promise.all([

          getSmartUnit(id),

          getTechnologyModels(),

        ]);


        const smartUnit =
          smartUnitResponse.data.smartUnit;


        setTechnologyModels(

          technologyResponse.data
            ?.technologyModels || []

        );


        setFormData({

          name:
            smartUnit.name || "",

          description:
            smartUnit.description || "",

          technologyModel:
            smartUnit.technologyModel?._id || "",

          serialNumber:
            smartUnit.serialNumber || "",

          costPrice:
            smartUnit.costPrice ?? "",

          stock:
            smartUnit.stock ?? "",

          firmwareVersion:
            smartUnit.firmwareVersion || "",

          manufacturer:
            smartUnit.manufacturer || "",

          notes:
            smartUnit.notes || "",

          status:
            smartUnit.status || "available",

        });

      }

      catch (error) {

        console.error(error);

        setError(

          error?.response?.data?.message ||

          "Failed to load Smart Unit."

        );

      }

      finally {

        setIsLoading(false);

      }

    };


    loadData();

  }, [id]);


  // ==========================
  // Handle Change
  // ==========================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(previous => ({

      ...previous,

      [name]: value,

    }));

  };


  // ==========================
  // Submit
  // ==========================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");

    setIsSaving(true);


    try {

      await updateSmartUnit(

        id,

        {

          ...formData,

          costPrice:
            Number(formData.costPrice),

          stock:
            Number(formData.stock),

        }

      );


      navigate(
        "/admin/smart-units"
      );

    }

    catch (error) {

      console.error(error);

      setError(

        error?.response?.data?.message ||

        "Failed to update Smart Unit."

      );

    }

    finally {

      setIsSaving(false);

    }

  };


  // ==========================
  // Loading
  // ==========================

  if (isLoading) {

    return (

      <div className="min-h-screen bg-slate-50">

        <div className="flex min-h-screen items-center justify-center">

          <div className="flex flex-col items-center gap-4">

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="text-sm font-medium text-slate-500">

              Loading Smart Unit...

            </p>

          </div>

        </div>

      </div>

    );

  }


  // ==========================
  // Page
  // ==========================

  return (

    <div className="min-h-screen bg-slate-50">


      {/* ==========================
          Header
      ========================== */}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <Link
                to="/admin/smart-units"
                className="transition hover:text-slate-900"
              >

                Smart Units

              </Link>

              <span>
                /
              </span>

              <span>
                Edit
              </span>

            </div>


            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">

              Edit Smart Unit

            </h1>


            <p className="mt-1 text-sm text-slate-500">

              Update Smart Unit information and configuration

            </p>

          </div>


          <Link
            to="/admin/smart-units"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >

            ← Back

          </Link>

        </div>

      </header>


      {/* ==========================
          Main
      ========================== */}

      <main className="mx-auto max-w-6xl px-6 py-10">


        {/* Error */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

            <span className="text-lg">
              ⚠️
            </span>

            <div>

              <p className="font-semibold">

                Something went wrong

              </p>

              <p className="mt-1">

                {error}

              </p>

            </div>

          </div>

        )}


        <form onSubmit={handleSubmit}>


          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">


            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="space-y-6 lg:col-span-2">


              {/* ==========================
                  Basic Information
              ========================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                  <h2 className="text-lg font-bold text-slate-900">

                    Basic Information

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    Update the main information of this Smart Unit.

                  </p>

                </div>


                <div className="space-y-6 p-6">


                  {/* Name */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Name

                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter Smart Unit name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />

                  </div>


                  {/* Description */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Description

                    </label>

                    <textarea
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter a description for this Smart Unit"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />

                  </div>


                  {/* Technology Model */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Technology Model

                    </label>

                    <select
                      name="technologyModel"
                      value={formData.technologyModel}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    >

                      <option value="">

                        Select Technology Model

                      </option>


                      {technologyModels.map(
                        (technology) => (

                          <option
                            key={technology._id}
                            value={technology._id}
                          >

                            {technology.modelName}

                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

              </section>


              {/* ==========================
                  Inventory Information
              ========================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                  <h2 className="text-lg font-bold text-slate-900">

                    Inventory Information

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    Manage serial number, pricing and stock.

                  </p>

                </div>


                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">


                  {/* Serial Number */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Serial Number

                    </label>

                    <input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g. SN-001234"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm uppercase text-slate-900 outline-none transition placeholder:font-sans placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />

                  </div>


                  {/* Cost Price */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Cost Price

                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        min="0"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">

                        EGP

                      </span>

                    </div>

                  </div>


                  {/* Stock */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Stock

                    </label>

                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />

                  </div>


                  {/* Firmware */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Firmware Version

                    </label>

                    <input
                      type="text"
                      name="firmwareVersion"
                      value={formData.firmwareVersion}
                      onChange={handleChange}
                      placeholder="e.g. v1.0.2"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />

                  </div>

                </div>

              </section>


              {/* ==========================
                  Additional Information
              ========================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                  <h2 className="text-lg font-bold text-slate-900">

                    Additional Information

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    Add manufacturer and internal notes.

                  </p>

                </div>


                <div className="space-y-6 p-6">


                  {/* Manufacturer */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Manufacturer

                    </label>

                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="Enter manufacturer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />

                  </div>


                  {/* Notes */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                      Notes

                    </label>

                    <textarea
                      rows={4}
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add internal notes..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />

                  </div>

                </div>

              </section>

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="space-y-6">


              {/* ==========================
                  Status
              ========================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                  <h2 className="text-lg font-bold text-slate-900">

                    Status

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    Current Smart Unit status.

                  </p>

                </div>


                <div className="p-6">

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                  >

                    <option value="available">
                      Available
                    </option>

                    <option value="reserved">
                      Reserved
                    </option>

                    <option value="assigned">
                      Assigned
                    </option>

                    <option value="activated">
                      Activated
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                    <option value="damaged">
                      Damaged
                    </option>

                  </select>


                  <div className="mt-4 rounded-xl bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500">

                      Current status

                    </p>

                    <p className="mt-1 text-sm font-bold capitalize text-slate-900">

                      {formData.status}

                    </p>

                  </div>

                </div>

              </section>


              {/* ==========================
                  Unit Summary
              ========================== */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                  <h2 className="text-lg font-bold text-slate-900">

                    Unit Summary

                  </h2>

                </div>


                <div className="space-y-4 p-6">


                  {/* Stock */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">

                      Stock

                    </span>

                    <span className="font-semibold text-slate-900">

                      {formData.stock || 0}

                    </span>

                  </div>


                  {/* Cost */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">

                      Cost

                    </span>

                    <span className="font-semibold text-slate-900">

                      {formData.costPrice || 0} EGP

                    </span>

                  </div>


                  {/* Firmware */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">

                      Firmware

                    </span>

                    <span className="max-w-[120px] truncate font-semibold text-slate-900">

                      {formData.firmwareVersion || "-"}

                    </span>

                  </div>


                  {/* Manufacturer */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">

                      Manufacturer

                    </span>

                    <span className="max-w-[120px] truncate font-semibold text-slate-900">

                      {formData.manufacturer || "-"}

                    </span>

                  </div>

                </div>

              </section>

            </div>

          </div>


          {/* ==========================
              Actions
          ========================== */}

          <div className="mt-6 flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <Link
              to="/admin/smart-units"
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >

              Cancel

            </Link>


            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isSaving ? (

                <span className="flex items-center gap-2">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Updating...

                </span>

              ) : (

                "Update Smart Unit"

              )}

            </button>

          </div>

        </form>

      </main>

    </div>

  );

};


export default EditSmartUnitPage;