import { Fragment, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  getSmartUnits,
  getSmartUnitInstances,
  deleteSmartUnit,
  updateSmartUnitInstance,
  deleteSmartUnitInstance,
} from "../services/smartUnitApi";

const AdminSmartUnitsPage = () => {
  const [smartUnits, setSmartUnits] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [expandedUnit, setExpandedUnit] = useState(null);

  const [instances, setInstances] = useState({});

  const [loadingInstances, setLoadingInstances] = useState({});

  const [instanceErrors, setInstanceErrors] = useState({});

  // =============================
  // Instance Modal
  // =============================

  const [selectedInstance, setSelectedInstance] = useState(null);

  const [showInstanceModal, setShowInstanceModal] = useState(false);

  const [instanceForm, setInstanceForm] = useState({
    status: "available",

    firmwareVersion: "",

    notes: "",

    damagedReason: "",
  });

  // =============================
  // Load Smart Units
  // =============================

  const loadSmartUnits = async () => {
    try {
      setIsLoading(true);

      setError("");

      const response = await getSmartUnits();

      const units = response?.data?.smartUnits || response?.smartUnits || [];

      setSmartUnits(Array.isArray(units) ? units : []);
    } catch (error) {
      console.error("Load Smart Units Error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load Smart Units.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSmartUnits();
  }, []);

  // =============================
  // Load Instances
  // =============================

  const loadInstances = async (smartUnitId) => {
    if (!smartUnitId) return;

    try {
      setLoadingInstances((previous) => ({
        ...previous,

        [smartUnitId]: true,
      }));

      setInstanceErrors((previous) => ({
        ...previous,

        [smartUnitId]: "",
      }));

      const response = await getSmartUnitInstances(smartUnitId);

      const unitInstances =
        response?.data?.instances || response?.instances || [];

      setInstances((previous) => ({
        ...previous,

        [smartUnitId]: Array.isArray(unitInstances) ? unitInstances : [],
      }));
    } catch (error) {
      console.error("Load Instances Error:", error);

      setInstanceErrors((previous) => ({
        ...previous,

        [smartUnitId]:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load instances.",
      }));
    } finally {
      setLoadingInstances((previous) => ({
        ...previous,

        [smartUnitId]: false,
      }));
    }
  };

  // =============================
  // Expand Instances
  // =============================

  const toggleInstances = async (smartUnitId) => {
    if (expandedUnit === smartUnitId) {
      setExpandedUnit(null);

      return;
    }

    setExpandedUnit(smartUnitId);

    if (Object.prototype.hasOwnProperty.call(instances, smartUnitId)) {
      return;
    }

    await loadInstances(smartUnitId);
  };

  // =============================
  // Delete Smart Unit
  // =============================

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this Smart Unit?");

    if (!confirmed) return;

    try {
      await deleteSmartUnit(id);

      setSmartUnits((previous) => previous.filter((item) => item._id !== id));
    } catch (error) {
      alert(error?.response?.data?.message || "Delete failed");
    }
  };

  // =============================
  // Open Instance Edit
  // =============================

  const openEditInstance = (instance) => {
    setSelectedInstance(instance);

    setInstanceForm({
      status: instance.status || "available",

      firmwareVersion: instance.firmwareVersion || "",

      notes: instance.notes || "",

      damagedReason: instance.damagedReason || "",
    });

    setShowInstanceModal(true);
  };

  const closeInstanceModal = () => {
    setSelectedInstance(null);

    setShowInstanceModal(false);
  };
  // =============================
  // Update Instance
  // =============================

  const handleInstanceUpdate = async (event) => {
    event.preventDefault();

    if (!selectedInstance) return;

    try {
      await updateSmartUnitInstance(
        selectedInstance._id,

        instanceForm,
      );

      const smartUnitId =
        selectedInstance.smartUnit?._id || selectedInstance.smartUnit;

      await loadInstances(smartUnitId);

      closeInstanceModal();
    } catch (error) {
      console.error("Update Instance Error:", error);

      alert(error?.response?.data?.message || "Update failed");
    }
  };

  // =============================
  // Delete Instance
  // =============================

  const handleDeleteInstance = async (instance) => {
    const confirmed = window.confirm(`Delete ${instance.serialNumber}?`);

    if (!confirmed) return;

    try {
      await deleteSmartUnitInstance(instance._id);

      const smartUnitId = instance.smartUnit?._id || instance.smartUnit;

      await loadInstances(smartUnitId);
    } catch (error) {
      console.error("Delete Instance Error:", error);

      alert(error?.response?.data?.message || "Delete instance failed");
    }
  };

  // =============================
  // Helpers
  // =============================

  const getUnitInstances = (smartUnitId) => {
    return instances[smartUnitId] || [];
  };

  const getInstanceSerial = (instance) => {
    return instance?.serialNumber || "NO SERIAL";
  };

  const getInstanceStatus = (instance) => {
    return instance?.status || "available";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "available":
        return;
        "border-[#B8D8C0] bg-[#EEF8F0] text-[#467454]";

      case "reserved":
        return;
        "border-[#E5D3A7] bg-[#FBF6E9] text-[#8A6A2F]";

      case "assigned":
        return;
        "border-[#BFD1E8] bg-[#EEF4FB] text-[#4D6F99]";

      case "activated":
        return;
        "border-[#D8C7E8] bg-[#F6F0FA] text-[#79538F]";

      case "inactive":
        return;
        "border-[#D9D5D0] bg-[#F4F2F0] text-[#77716A]";

      case "damaged":
        return;
        "border-[#E7C1C1] bg-[#FCF0F0] text-[#A65353]";

      default:
        return;
        "border-light-champagne bg-warm-ivory text-slate-gray";
    }
  };

  const getCounts = (smartUnit) => {
    const list = getUnitInstances(smartUnit._id);

    return {
      total: list.length,

      available: list.filter((item) => item.status === "available").length,

      reserved: list.filter((item) => item.status === "reserved").length,

      assigned: list.filter((item) => item.status === "assigned").length,

      activated: list.filter((item) => item.status === "activated").length,

      inactive: list.filter((item) => item.status === "inactive").length,

      damaged: list.filter((item) => item.status === "damaged").length,
    };
  };

  return (
    <div
      className="
      relative
      min-h-screen
      bg-warm-ivory
      text-midnight-navy
    "
    >
      <header
        className="
        border-b
        border-light-champagne
        bg-soft-white
      "
      >
        <div
          className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-8
          py-8
        "
        >
          <div>
            <p
              className="
              text-[10px]
              uppercase
              tracking-[0.25em]
              text-antique-gold
            "
            >
              Smart Jewelry Inventory
            </p>

            <h1
              className="
              mt-3
              font-serif
              text-[3rem]
            "
            >
              Smart Units
            </h1>

            <p
              className="
              mt-2
              text-sm
              text-slate-gray
            "
            >
              Manage smart units and physical serial devices.
            </p>
          </div>

          <Link
            to="/admin/smart-units/new"
            className="
              rounded-xl
              bg-midnight-navy
              px-6
              py-3
              text-xs
              font-semibold
              text-white
            "
          >
            <span className="text-champagne-gold">+</span>
            Add Smart Unit
          </Link>
        </div>
      </header>

      <main
        className="
        mx-auto
        max-w-7xl
        px-8
        py-10
      "
      >
        {error && (
          <div
            className="
            mb-6
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            text-red-600
          "
          >
            {error}
          </div>
        )}
        {isLoading ? (
          <div
            className="
            rounded-2xl
            bg-white
            p-20
            text-center
          "
          >
            Loading Smart Units...
          </div>
        ) : (
          <div
            className="
            overflow-hidden
            rounded-3xl
            border
            border-light-champagne
            bg-white
          "
          >
            <table
              className="
              w-full
            "
            >
              <thead>
                <tr
                  className="
                  border-b
                  bg-warm-ivory
                "
                >
                  <th
                    className="
                    px-6
                    py-5
                    text-left
                    text-xs
                  "
                  >
                    Smart Unit
                  </th>

                  <th
                    className="
                    px-6
                    py-5
                    text-left
                    text-xs
                  "
                  >
                    Technology
                  </th>

                  <th
                    className="
                    px-6
                    py-5
                    text-center
                    text-xs
                  "
                  >
                    Stock
                  </th>

                  <th
                    className="
                    px-6
                    py-5
                    text-left
                    text-xs
                  "
                  >
                    Status
                  </th>

                  <th
                    className="
                    px-6
                    py-5
                    text-center
                    text-xs
                  "
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {smartUnits.map((smartUnit) => (
                  <Fragment key={smartUnit._id}>
                    <tr
                      className="
                          border-b
                        "
                    >
                      <td
                        className="
                            px-6
                            py-5
                          "
                      >
                        <div
                          className="
                              flex
                              items-center
                              gap-4
                            "
                        >
                          <div
                            className="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-xl
                                bg-soft-cream
                                text-antique-gold
                              "
                          >
                            ✦
                          </div>

                          <div>
                            <p
                              className="
                                  font-semibold
                                "
                            >
                              {smartUnit.name}
                            </p>

                            <p
                              className="
                                  text-xs
                                  text-slate-gray
                                "
                            >
                              {smartUnit.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className="
                            px-6
                            py-5
                            text-sm
                          "
                      >
                        {smartUnit.technologyModel?.modelName || "-"}
                      </td>

                      <td
                        className="
                            px-6
                            py-5
                            text-center
                          "
                      >
                        <button
                          onClick={() => toggleInstances(smartUnit._id)}
                          className="
                                rounded-xl
                                border
                                px-5
                                py-3
                              "
                        >
                          <div
                            className="
                                font-serif
                                text-xl
                              "
                          >
                            {smartUnit.stock}
                          </div>

                          <span
                            className="
                                text-xs
                                text-slate-gray
                              "
                          >
                            Units
                          </span>
                        </button>
                      </td>

                      <td
                        className="
                            px-6
                            py-5
                          "
                      >
                        <span
                          className={`

                                rounded-full

                                border

                                px-3

                                py-1

                                text-xs

                                capitalize

                                ${getStatusStyle(smartUnit.status)}

                              `}
                        >
                          {smartUnit.status}
                        </span>
                      </td>

                      <td
                        className="
                            px-6
                            py-5
                            text-center
                          "
                      >
                        <div
                          className="
                              flex
                              justify-center
                              gap-2
                            "
                        >
                          <Link
                            to={`/admin/smart-units/${smartUnit._id}/edit`}
                            className="
                                  rounded-lg
                                  border
                                  px-4
                                  py-2
                                  text-xs
                                "
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => handleDelete(smartUnit._id)}
                            className="
                                  rounded-lg
                                  border
                                  border-red-200
                                  px-4
                                  py-2
                                  text-xs
                                  text-red-600
                                "
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedUnit === smartUnit._id && (
                      <tr
                        className="
                              border-b
                              bg-warm-ivory/40
                            "
                      >
                        <td
                          colSpan={5}
                          className="
                                  px-8
                                  py-8
                                "
                        >
                          <div
                            className="
                                  rounded-2xl
                                  border
                                  border-light-champagne
                                  bg-soft-white
                                  p-6
                                "
                          >
                            <div
                              className="
                                    mb-6
                                    flex
                                    items-center
                                    justify-between
                                  "
                            >
                              <div>
                                <p
                                  className="
                                        text-[10px]
                                        uppercase
                                        tracking-widest
                                        text-antique-gold
                                      "
                                >
                                  Physical Inventory
                                </p>

                                <h3
                                  className="
                                        mt-2
                                        font-serif
                                        text-2xl
                                      "
                                >
                                  {smartUnit.name} Units
                                </h3>
                              </div>

                              <div
                                className="
                                      rounded-full
                                      border
                                      border-light-champagne
                                      px-4
                                      py-2
                                      text-xs
                                    "
                              >
                                {getCounts(smartUnit).total} Devices
                              </div>
                            </div>
                            {loadingInstances[smartUnit._id] ? (
                              <div
                                className="
                                      py-10
                                      text-center
                                      text-sm
                                      text-slate-gray
                                    "
                              >
                                Loading devices...
                              </div>
                            ) : instanceErrors[smartUnit._id] ? (
                              <div
                                className="
                                      rounded-xl
                                      border
                                      border-red-200
                                      bg-red-50
                                      p-5
                                      text-sm
                                      text-red-600
                                    "
                              >
                                {instanceErrors[smartUnit._id]}
                              </div>
                            ) : getUnitInstances(smartUnit._id).length === 0 ? (
                              <div
                                className="
                                      rounded-xl
                                      border
                                      border-dashed
                                      p-10
                                      text-center
                                      text-sm
                                      text-slate-gray
                                    "
                              >
                                No serial numbers found.
                              </div>
                            ) : (
                              <div
                                className="
                                      grid
                                      grid-cols-1
                                      gap-5
                                      md:grid-cols-2
                                      xl:grid-cols-3
                                    "
                              >
                                {getUnitInstances(smartUnit._id).map(
                                  (instance) => (
                                    <div
                                      key={instance._id}
                                      className="
                                                rounded-2xl
                                                border
                                                border-light-champagne
                                                bg-warm-ivory
                                                p-5
                                              "
                                    >
                                      <div
                                        className="
                                                flex
                                                items-start
                                                justify-between
                                                gap-3
                                              "
                                      >
                                        <div>
                                          <p
                                            className="
                                                    text-[10px]
                                                    uppercase
                                                    tracking-widest
                                                    text-antique-gold
                                                  "
                                          >
                                            Serial Number
                                          </p>

                                          <p
                                            className="
                                                    mt-2
                                                    break-all
                                                    font-mono
                                                    text-sm
                                                    font-semibold
                                                  "
                                          >
                                            {getInstanceSerial(instance)}
                                          </p>
                                        </div>

                                        <span
                                          className={`

                                                    rounded-full

                                                    border

                                                    px-3

                                                    py-1

                                                    text-[10px]

                                                    capitalize

                                                    ${getStatusStyle(
                                                      getInstanceStatus(
                                                        instance,
                                                      ),
                                                    )}

                                                  `}
                                        >
                                          {getInstanceStatus(instance)}
                                        </span>
                                      </div>

                                      <div
                                        className="
                                                mt-5
                                                space-y-3
                                                border-t
                                                border-light-champagne
                                                pt-4
                                              "
                                      >
                                        <div
                                          className="
                                                  flex
                                                  justify-between
                                                  text-xs
                                                "
                                        >
                                          <span
                                            className="
                                                    text-slate-gray
                                                  "
                                          >
                                            Unique Code
                                          </span>

                                          <span
                                            className="
                                                    font-mono
                                                  "
                                          >
                                            {instance.uniqueCode || "-"}
                                          </span>
                                        </div>

                                        <div
                                          className="
                                                  flex
                                                  justify-between
                                                  text-xs
                                                "
                                        >
                                          <span
                                            className="
                                                    text-slate-gray
                                                  "
                                          >
                                            Added Date
                                          </span>

                                          <span>
                                            {instance.createdAt
                                              ? new Date(
                                                  instance.createdAt,
                                                ).toLocaleDateString()
                                              : "-"}
                                          </span>
                                        </div>

                                        <div
                                          className="
                                                  flex
                                                  justify-between
                                                  text-xs
                                                "
                                        >
                                          <span
                                            className="
                                                    text-slate-gray
                                                  "
                                          >
                                            Firmware
                                          </span>

                                          <span>
                                            {instance.firmwareVersion
                                              ? `v${instance.firmwareVersion}`
                                              : "-"}
                                          </span>
                                        </div>
                                      </div>

                                      <div
                                        className="
                                                mt-5
                                                flex
                                                gap-2
                                              "
                                      >
                                        <button
                                          onClick={() =>
                                            openEditInstance(instance)
                                          }
                                          className="
                                                    flex-1
                                                    rounded-lg
                                                    border
                                                    border-light-champagne
                                                    bg-white
                                                    px-3
                                                    py-2
                                                    text-xs
                                                  "
                                        >
                                          Edit
                                        </button>

                                        <button
                                          onClick={() =>
                                            handleDeleteInstance(instance)
                                          }
                                          className="
                                                    flex-1
                                                    rounded-lg
                                                    border
                                                    border-red-200
                                                    bg-white
                                                    px-3
                                                    py-2
                                                    text-xs
                                                    text-red-600
                                                  "
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showInstanceModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-5
          "
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-3xl
              bg-white
              p-7
            "
          >
            <h2
              className="
                mb-6
                font-serif
                text-2xl
              "
            >
              Edit Physical Unit
            </h2>

            <form
              onSubmit={handleInstanceUpdate}
              className="
                  space-y-5
                "
            >
              <input
                value={selectedInstance?.serialNumber || ""}
                disabled
                className="
                    w-full
                    rounded-xl
                    border
                    bg-gray-100
                    px-4
                    py-3
                  "
              />

              <select
                value={instanceForm.status}
                onChange={(e) =>
                  setInstanceForm((previous) => ({
                    ...previous,

                    status: e.target.value,
                  }))
                }
                className="
                    w-full
                    rounded-xl
                    border
                    px-4
                    py-3
                  "
              >
                <option value="available">Available</option>

                <option value="reserved">Reserved</option>

                <option value="assigned">Assigned</option>

                <option value="activated">Activated</option>

                <option value="inactive">Inactive</option>

                <option value="damaged">Damaged</option>
              </select>

              {instanceForm.status === "damaged" && (
                <textarea
                  rows="3"
                  value={instanceForm.damagedReason}
                  onChange={(e) =>
                    setInstanceForm((previous) => ({
                      ...previous,

                      damagedReason: e.target.value,
                    }))
                  }
                  placeholder="Damage reason"
                  className="
                      w-full
                      rounded-xl
                      border
                      px-4
                      py-3
                    "
                />
              )}

              <input
                value={instanceForm.firmwareVersion}
                onChange={(e) =>
                  setInstanceForm((previous) => ({
                    ...previous,

                    firmwareVersion: e.target.value,
                  }))
                }
                placeholder="Firmware Version"
                className="
                    w-full
                    rounded-xl
                    border
                    px-4
                    py-3
                  "
              />

              <textarea
                rows="4"
                value={instanceForm.notes}
                onChange={(e) =>
                  setInstanceForm((previous) => ({
                    ...previous,

                    notes: e.target.value,
                  }))
                }
                placeholder="Notes"
                className="
                    w-full
                    rounded-xl
                    border
                    px-4
                    py-3
                  "
              />

              <div
                className="
                  flex
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={closeInstanceModal}
                  className="
                      flex-1
                      rounded-xl
                      border
                      px-5
                      py-3
                    "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                      flex-1
                      rounded-xl
                      bg-midnight-navy
                      px-5
                      py-3
                      text-white
                    "
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSmartUnitsPage;
