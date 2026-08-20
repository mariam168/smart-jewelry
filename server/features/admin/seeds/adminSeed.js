import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../../auth/models/User.js";
import Role from "../../auth/models/Role.js";

dotenv.config();

const ADMIN_EMAIL = "admin@smartjewelry.com";

const ADMIN_PASSWORD = "Admin@123456";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const adminRole = await Role.findOne({
      name: "admin",
    });

    if (!adminRole) {
      throw new Error("Admin role not found. Run auth seed first.");
    }

    const existingAdmin = await User.findOne({
      email: ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("Admin already exists.");

      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      firstName: "Smart",

      lastName: "Jewelry Admin",

      email: ADMIN_EMAIL,

      passwordHash: hashedPassword,

      role: adminRole._id,

      isEmailVerified: true,

      privacyConsent: true,

      marketingConsent: false,
    });

    console.log("Admin created successfully.");

    console.log(`Email: ${ADMIN_EMAIL}`);

    console.log(`Password: ${ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error("Admin Seed Error:", error);

    process.exit(1);
  }
};

seedAdmin();
