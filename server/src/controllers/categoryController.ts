import { Response } from "express";
import Category from "../models/Category";
import { AuthRequest } from "../middleware/authMiddleware";

export const createCategory = async (req: AuthRequest, res: Response) => {
  const { name, type } = req.body;
  const user = req.user;

  const category = await Category.create({ name, type, user });
  res.status(201).json(category);
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const categories = await Category.find({ user });
  res.json(categories);
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, type } = req.body;
  const userId = req.user;

  const category = await Category.findOneAndUpdate(
    { _id: id, user: userId },
    { name, type },
    { new: true }
  );

  if (!category) return res.status(404).json({ message: "Category not found" });

  res.json(category);
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user;

  const deleted = await Category.findOneAndDelete({ _id: id, user: userId });
  if (!deleted) return res.status(404).json({ message: "Category not found" });

  res.json({ message: "Category deleted successfully" });
};
