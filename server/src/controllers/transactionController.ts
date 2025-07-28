import { Request, Response } from "express";
import { Transaction } from "../models/Transaction";

export const createTransaction = async (req: Request, res: Response) => {
  const { title, amount, type, categoryId, date, notes } = req.body;
  const userId = (req as any).user;

  const transaction = await Transaction.create({
    title, amount, type, categoryId, userId, date, notes
  });

  res.status(201).json(transaction);
};

export const getTransactions = async (req: Request, res: Response) => {
  const userId = (req as any).user;
  const { category, startDate, endDate } = req.query;

  const filter: any = { userId };
  if (category) filter.categoryId = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate as string);
    if (endDate) filter.date.$lte = new Date(endDate as string);
  }

  const transactions = await Transaction.find(filter).sort({ date: -1 });
  res.json(transactions);
};

export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user;
  const { title, amount, type, categoryId, date, notes } = req.body;

  const updated = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    { title, amount, type, categoryId, date, notes },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Transaction not found" });

  res.json(updated);
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user;

  const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ message: "Transaction not found" });

  res.json({ message: "Transaction deleted successfully" });
};
