import mongoose from "mongoose";

const splitSchema = new mongoose.Schema({
  memberName: { type: String, required: true },
  shareAmount: { type: Number, required: true },
});

const groupExpenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    paidBy: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    splits: [splitSchema],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const GroupExpense = mongoose.model("GroupExpense", groupExpenseSchema);
