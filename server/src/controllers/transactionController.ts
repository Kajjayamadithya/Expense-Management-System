import { Response } from "express";
import { Transaction } from "../models/Transaction";
import { AuthRequest } from "../middleware/authMiddleware";

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const { title, amount, type, categoryId, date, notes } = req.body;
  const userId = req.user;

  const transaction = await Transaction.create({
    title, amount, type, categoryId, userId, date, notes
  });

  res.status(201).json(transaction);
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  const userId = req.user;
  const { category, startDate, endDate } = req.query;

  const filter: { userId?: string; categoryId?: unknown; date?: { $gte?: Date; $lte?: Date } } = { userId };
  if (category) filter.categoryId = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate as string);
    if (endDate) filter.date.$lte = new Date(endDate as string);
  }

  const transactions = await Transaction.find(filter)
    .populate("categoryId", "name type")
    .sort({ date: -1 });

  // Remap categoryId → category so the client interface stays consistent
  const mapped = transactions.map((tx) => {
    const obj = tx.toObject() as Record<string, unknown>;
    const category = obj.categoryId;
    const { categoryId, ...rest } = obj;
    return { ...rest, category };
  });

  res.json(mapped);
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user;
  const { title, amount, type, categoryId, date, notes } = req.body;

  const updated = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    { title, amount, type, categoryId, date, notes },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Transaction not found" });

  res.json(updated);
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user;

  const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ message: "Transaction not found" });

  res.json({ message: "Transaction deleted successfully" });
};
