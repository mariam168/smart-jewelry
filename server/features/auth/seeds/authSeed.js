import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../../../config/db.js";

import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

dotenv.config();

const permissionsData = [
  {
    name: "profile.read",
    description: "View own profile",
  },

  {
    name: "profile.update",
    description: "Update own profile",
  },

  {
    name: "profile.password.update",
    description: "Change own password",
  },
];

const seedAuthData = async () => {
  try {
    await connectDB();

    console.log("Starting Auth Seed...");

    // =======================
    // Permissions
    // =======================

    const permissions = [];

    for (const permissionData of permissionsData) {
      let permission = await Permission.findOne({
        name: permissionData.name,
      });

      if (!permission) {
        permission = await Permission.create(permissionData);

        console.log(`Permission created: ${permission.name}`);
      } else {
        console.log(`Permission exists: ${permission.name}`);
      }

      permissions.push(permission);
    }

    // =======================
    // Customer Role
    // =======================

    let customerRole = await Role.findOne({
      name: "customer",
    });

    if (!customerRole) {
      customerRole = await Role.create({
        name: "customer",

        description: "Platform customer",

        permissions: permissions.map((permission) => permission._id),
      });

      console.log("Customer role created");
    }

    // =======================
    // Admin Role
    // =======================

    let adminRole = await Role.findOne({
      name: "admin",
    });

    if (!adminRole) {
      adminRole = await Role.create({
        name: "admin",

        description: "Platform administrator",

        permissions: permissions.map((permission) => permission._id),
      });

      console.log("Admin role created");
    }

    // =======================
    // Super Admin Role
    // =======================

    let superAdminRole = await Role.findOne({
      name: "super_admin",
    });

    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: "super_admin",

        description: "Platform super administrator",

        permissions: permissions.map((permission) => permission._id),
      });

      console.log("Super admin role created");
    } else {
      console.log("Super admin already exists");
    }

    console.log("Auth Seed Completed Successfully");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Auth Seed Error:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedAuthData();
