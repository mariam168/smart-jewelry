import {
  getFinanceDashboard,
  createFinanceExpense,
  updateFinanceExpense,
  deleteFinanceExpense,
  getFinanceExpenses,
} from "../services/financeService.js";

export const getDashboard =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const data =
        await getFinanceDashboard({
          from:
            req.query.from,

          to:
            req.query.to,
        });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

export const getExpenses =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const data =
        await getFinanceExpenses({
          from:
            req.query.from,

          to:
            req.query.to,

          page:
            req.query.page,

          limit:
            req.query.limit,
        });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

export const addExpense =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const expense =
        await createFinanceExpense({
          ...req.body,

          createdBy:
            req.user?.userId ||
            null,
        });

      return res.status(201).json({
        success: true,
        message:
          "Expense added successfully",
        data: {
          expense,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const editExpense =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const expense =
        await updateFinanceExpense(
          req.params.id,
          req.body,
        );

      return res.status(200).json({
        success: true,
        message:
          "Expense updated successfully",
        data: {
          expense,
        },
      });
    } catch (error) {
      next(error);
    }
  };

export const removeExpense =
  async (
    req,
    res,
    next,
  ) => {
    try {
      await deleteFinanceExpense(
        req.params.id,
      );

      return res.status(200).json({
        success: true,
        message:
          "Expense deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };