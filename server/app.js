import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./features/auth/routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import orderRoutes from "./features/orders/routes/orderRoutes.js";
import homeRoutes from "./features/home/routes/homeRoutes.js";
import dashboardRoutes from "./features/admin/routes/dashboardRoutes.js";

import technologyRoutes from "./features/catalog/routes/technologyRoutes.js";
import smartUnitRoutes from "./features/catalog/routes/smartUnitRoutes.js";
import technologyModelRoutes from "./features/catalog/routes/technologyModelRoutes.js";
import productTechnologyRoutes from "./features/catalog/routes/productTechnologyRoutes.js";
import manufacturingRoutes from "./features/manufacturing/routes/manufacturingRoutes.js";
import experienceRoutes from "./features/experience/routes/experienceRoutes.js";

import uploadRoutes from "./routes/uploadRoutes.js";
import productRoutes from "./features/catalog/routes/productRoutes.js";
import categoryRoutes from "./features/catalog/routes/categoryRoutes.js";
import cartRoutes from "./features/cart/routes/cartRoutes.js";
import productVariantRoutes from "./features/catalog/routes/productVariantRoutes.js";
import productImageRoutes from "./features/catalog/routes/productImageRoutes.js";
import financeRoutes from "./features/finance/routes/financeRoutes.js";

import shippingRoutes from "./features/shipping/routes/shippingRoutes.js";
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://jevorya.com",
  "https://www.jevorya.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/product-images", productImageRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/experience", experienceRoutes);

app.use("/api/technologies", technologyRoutes);

app.use("/api/technology-models", technologyModelRoutes);

app.use("/api/product-technologies", productTechnologyRoutes);

app.use("/api/manufacturing", manufacturingRoutes);
app.use(
  "/api/shipping",
  shippingRoutes,
);
app.use("/api/categories", categoryRoutes);
app.use("/api/finance", financeRoutes);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Jewelry API is running",
  });
});

app.use("/api/product-variants", productVariantRoutes);

app.use("/api/smart-units", smartUnitRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/admin", dashboardRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/home", homeRoutes);

app.use(errorMiddleware);

export default app;
