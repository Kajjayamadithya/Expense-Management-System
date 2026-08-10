import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    monthlyLimit: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);
