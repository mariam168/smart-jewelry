import SmartUnit from "../models/SmartUnit.js";
import SmartUnitInstance from "../models/SmartUnitInstance.js";
import TechnologyModel from "../models/TechnologyModel.js";
import { generateSerialNumber } from "../../experience/utils/tokenGenerator.js";

const createSmartUnitInstances = async (smartUnit, quantity) => {
  if (!quantity || quantity <= 0) {
    return [];
  }

  const instances = [];

  for (let i = 0; i < quantity; i++) {
    instances.push({
      smartUnit: smartUnit._id,

      serialNumber: generateSerialNumber(),

      status: "available",

      firmwareVersion: smartUnit.firmwareVersion || "",
    });
  }

  return await SmartUnitInstance.insertMany(instances);
};

export const createSmartUnit = async (smartUnitData) => {
  const technologyModel = await TechnologyModel.findById(
    smartUnitData.technologyModel,
  );

  if (!technologyModel) {
    const error = new Error("Technology model not found.");

    error.statusCode = 404;

    throw error;
  }

  const stock = Number(smartUnitData.stock || 0);

  const smartUnit = await SmartUnit.create({
    ...smartUnitData,
    stock,
  });

  if (stock > 0) {
    await createSmartUnitInstances(smartUnit, stock);
  }

  return await smartUnit.populate("technologyModel");
};

export const getSmartUnits = async () => {
  const smartUnits = await SmartUnit.find()
    .populate("technologyModel")
    .sort({
      createdAt: -1,
    })
    .lean();

  const smartUnitIds = smartUnits.map((smartUnit) => smartUnit._id);

  const instanceCounts = await SmartUnitInstance.aggregate([
    {
      $match: {
        smartUnit: {
          $in: smartUnitIds,
        },
      },
    },
    {
      $group: {
        _id: "$smartUnit",

        total: {
          $sum: 1,
        },

        available: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "available"],
              },
              1,
              0,
            ],
          },
        },

        reserved: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "reserved"],
              },
              1,
              0,
            ],
          },
        },

        assigned: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "assigned"],
              },
              1,
              0,
            ],
          },
        },

        activated: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "activated"],
              },
              1,
              0,
            ],
          },
        },

        inactive: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "inactive"],
              },
              1,
              0,
            ],
          },
        },

        damaged: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "damaged"],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const countsMap = new Map(
    instanceCounts.map((item) => [item._id.toString(), item]),
  );

  return smartUnits.map((smartUnit) => {
    const counts = countsMap.get(smartUnit._id.toString()) || {
      total: 0,
      available: 0,
      reserved: 0,
      assigned: 0,
      activated: 0,
      inactive: 0,
      damaged: 0,
    };

    return {
      ...smartUnit,

      stock: counts.total,

      availableStock: counts.available,

      reservedStock: counts.reserved,

      assignedStock: counts.assigned,

      activatedStock: counts.activated,

      inactiveStock: counts.inactive,

      damagedStock: counts.damaged,
    };
  });
};

export const getSmartUnitById = async (id) => {
  const smartUnit = await SmartUnit.findById(id)
    .populate("technologyModel")
    .lean();

  if (!smartUnit) {
    return null;
  }

  const instances = await SmartUnitInstance.find({
    smartUnit: id,
  }).sort({
    createdAt: 1,
  });

  return {
    ...smartUnit,

    stock: instances.length,

    instances,
  };
};

export const updateSmartUnit = async (id, smartUnitData) => {
  if (smartUnitData.technologyModel) {
    const technologyModel = await TechnologyModel.findById(
      smartUnitData.technologyModel,
    );

    if (!technologyModel) {
      const error = new Error("Technology model not found.");

      error.statusCode = 404;

      throw error;
    }
  }

  const currentSmartUnit = await SmartUnit.findById(id);

  if (!currentSmartUnit) {
    return null;
  }

  const currentInstanceCount = await SmartUnitInstance.countDocuments({
    smartUnit: id,
  });

  const requestedStock =
    smartUnitData.stock !== undefined
      ? Number(smartUnitData.stock)
      : currentInstanceCount;

  if (Number.isNaN(requestedStock) || requestedStock < 0) {
    const error = new Error("Stock must be a valid non-negative number.");

    error.statusCode = 400;

    throw error;
  }

  if (requestedStock > currentInstanceCount) {
    const quantityToCreate = requestedStock - currentInstanceCount;

    const smartUnitForInstances = {
      ...currentSmartUnit.toObject(),
      ...smartUnitData,
    };

    await createSmartUnitInstances(smartUnitForInstances, quantityToCreate);
  }

  if (requestedStock < currentInstanceCount) {
    const quantityToRemove = currentInstanceCount - requestedStock;

    const availableInstances = await SmartUnitInstance.find({
      smartUnit: id,
      status: "available",
    })
      .sort({
        createdAt: -1,
      })
      .limit(quantityToRemove);

    if (availableInstances.length < quantityToRemove) {
      const error = new Error(
        "Cannot reduce stock because some units are already reserved, assigned, activated, inactive, or damaged.",
      );

      error.statusCode = 400;

      throw error;
    }

    await SmartUnitInstance.deleteMany({
      _id: {
        $in: availableInstances.map((instance) => instance._id),
      },
    });
  }

  const updateData = {
    ...smartUnitData,
    stock: requestedStock,
  };

  delete updateData.stock;

  const smartUnit = await SmartUnit.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("technologyModel");

  return smartUnit;
};

export const deleteSmartUnit = async (id) => {
  const instances = await SmartUnitInstance.countDocuments({
    smartUnit: id,
  });

  if (instances > 0) {
    const error = new Error(
      "Cannot delete a Smart Unit while it has physical instances.",
    );

    error.statusCode = 400;

    throw error;
  }

  return await SmartUnit.findByIdAndDelete(id);
};

export const getSmartUnitInstances = async (smartUnitId) => {
  return await SmartUnitInstance.find({
    smartUnit: smartUnitId,
  })
    .populate({
      path: "smartUnit",

      populate: {
        path: "technologyModel",
      },
    })
    .sort({
      createdAt: 1,
    });
};
