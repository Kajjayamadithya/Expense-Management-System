import { Request, Response } from "express";
import  Category  from "../models/Category";

export const createCategory = async (req: Request, res: Response) => {
  const { name, type } = req.body;
  const user = (req as any).user;

  const category = await Category.create({ name, type, user });
  res.status(201).json(category);
};

export const getCategories = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const categories = await Category.find({ user });
  res.json(categories);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type } = req.body;
  const userId = (req as any).user;

  const category = await Category.findOneAndUpdate(
    { _id: id, userId },
    { name, type },
    { new: true }
  );

  if (!category) return res.status(404).json({ message: "Category not found" });

  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user;

  const deleted = await Category.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ message: "Category not found" });

  res.json({ message: "Category deleted successfully" });
};
