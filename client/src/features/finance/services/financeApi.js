import api from "../../../lib/axios";

export const getFinanceDashboard =
  async ({
    from = "",
    to = "",
  } = {}) => {
    const params = {};

    if (from) {
      params.from = from;
    }

    if (to) {
      params.to = to;
    }

    const { data } =
      await api.get(
        "/finance/dashboard",
        {
          params,
        },
      );

    return data;
  };

export const getFinanceExpenses =
  async ({
    from = "",
    to = "",
    page = 1,
    limit = 20,
  } = {}) => {
    const params = {
      page,
      limit,
    };

    if (from) {
      params.from = from;
    }

    if (to) {
      params.to = to;
    }

    const { data } =
      await api.get(
        "/finance/expenses",
        {
          params,
        },
      );

    return data;
  };

export const createFinanceExpense =
  async (payload) => {
    const { data } =
      await api.post(
        "/finance/expenses",
        payload,
      );

    return data;
  };

export const updateFinanceExpense =
  async (
    id,
    payload,
  ) => {
    const { data } =
      await api.patch(
        `/finance/expenses/${id}`,
        payload,
      );

    return data;
  };

export const deleteFinanceExpense =
  async (id) => {
    const { data } =
      await api.delete(
        `/finance/expenses/${id}`,
      );

    return data;
  };