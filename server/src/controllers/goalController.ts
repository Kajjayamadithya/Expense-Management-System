import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Goal } from "../models/Goal";

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goals", error });
  }
};

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const { title, targetAmount, currentAmount, deadline, icon, color } = req.body;

    const goal = await Goal.create({
      userId,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      icon: icon || "🎯",
      color: color || "#6366f1",
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error creating goal", error });
  }
};

export const depositToGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { amount } = req.body;

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    goal.currentAmount = (goal.currentAmount || 0) + Number(amount);
    await goal.save();

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error updating goal deposit", error });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const { id } = req.params;
    await Goal.deleteOne({ _id: id, userId });
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goal", error });
  }
};
