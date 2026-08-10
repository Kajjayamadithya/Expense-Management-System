import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Budget } from "../models/Budget";
import { Transaction } from "../models/Transaction";
import mongoose from "mongoose";

export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const budgets = await Budget.find({ userId }).populate("categoryId");

    // Calculate current month's spending per category
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();

    const spendingAgg = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId as string),
          type: "expense",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          spentAmount: { $sum: "$amount" },
        },
      },
    ]);

    const spendingMap = new Map<string, number>();
    spendingAgg.forEach((item) => {
      if (item._id) spendingMap.set(item._id.toString(), item.spentAmount);
    });

    const result = budgets.map((b) => {
      const catObj = b.categoryId as unknown as { _id?: mongoose.Types.ObjectId };
      const catId = catObj?._id?.toString() || b.categoryId?.toString();
      const spent = (catId && spendingMap.get(catId)) || 0;
      return {
        _id: b._id,
        category: b.categoryId,
        monthlyLimit: b.monthlyLimit,
        spentAmount: spent,
        percentage: Math.min(100, Math.round((spent / b.monthlyLimit) * 100)),
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching budgets", error });
  }
};

export const setBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const { categoryId, monthlyLimit } = req.body;

    let budget = await Budget.findOne({ userId, categoryId });
    if (budget) {
      budget.monthlyLimit = monthlyLimit;
      await budget.save();
    } else {
      budget = await Budget.create({ userId, categoryId, monthlyLimit });
    }

    await budget.populate("categoryId");
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: "Error setting budget", error });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const { id } = req.params;
    await Budget.deleteOne({ _id: id, userId });
    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting budget", error });
  }
};
