import express from "express";

import {
  getDashboard,
  getExpenses,
  addExpense,
  editExpense,
  removeExpense,
} from "../controllers/financeController.js";

import {
  protect,
} from "../../auth/middleware/authMiddleware.js";

import adminMiddleware from "../../admin/middleware/adminMiddleware.js";

const router =
  express.Router();

router.use(
  protect,
  adminMiddleware,
);

router.get(
  "/dashboard",
  getDashboard,
);

router
  .route("/expenses")
  .get(
    getExpenses,
  )
  .post(
    addExpense,
  );

router
  .route("/expenses/:id")
  .patch(
    editExpense,
  )
  .delete(
    removeExpense,
  );

export default router;