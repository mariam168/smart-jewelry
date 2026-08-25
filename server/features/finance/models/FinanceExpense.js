import mongoose from "mongoose";

const financeExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    category: {
      type: String,
      enum: [
        "marketing",
        "shipping",
        "packaging",
        "manufacturing",
        "rent",
        "salary",
        "software",
        "refund",
        "maintenance",
        "other",
      ],
      default: "other",
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    expenseDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

financeExpenseSchema.index({
  expenseDate: -1,
  category: 1,
});

const FinanceExpense =
  mongoose.models.FinanceExpense ||
  mongoose.model(
    "FinanceExpense",
    financeExpenseSchema,
  );

export default FinanceExpense;