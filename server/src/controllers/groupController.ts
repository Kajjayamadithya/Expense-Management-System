import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Group } from "../models/Group";
import { GroupExpense } from "../models/GroupExpense";
import { User } from "../models/User";

export const getGroups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const currentUser = await User.findById(userId);
    const userName = currentUser?.name || "";
    const userEmail = currentUser?.email || "";

    const groups = await Group.find({
      $or: [
        { createdBy: userId },
        { members: userName },
        { members: userEmail },
      ],
    }).sort({ updatedAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups", error });
  }
};

export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    const currentUser = await User.findById(userId);
    const userName = currentUser?.name || "Me";
    const { name, description, members } = req.body;

    const allMembers = Array.from(new Set([userName, ...(members || [])]));

    const group = await Group.create({
      name,
      description,
      createdBy: userId,
      members: allMembers,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error });
  }
};

export const getGroupDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    const expenses = await GroupExpense.find({ groupId: id }).sort({ date: -1 });

    // Calculate balances for each member
    // balance > 0 means the member is owed money; balance < 0 means member owes money
    const balances: Record<string, number> = {};
    group.members.forEach((m) => (balances[m] = 0));

    expenses.forEach((exp) => {
      const payer = exp.paidBy;
      if (balances[payer] === undefined) balances[payer] = 0;
      balances[payer] += exp.amount;

      exp.splits.forEach((split) => {
        if (balances[split.memberName] === undefined) balances[split.memberName] = 0;
        balances[split.memberName] -= split.shareAmount;
      });
    });

    // Simplify debts into settlement transactions ("A owes B ₹X")
    const debts: Array<{ from: string; to: string; amount: number }> = [];
    const debtors = Object.entries(balances)
      .filter(([_, val]) => val < -0.01)
      .map(([name, val]) => ({ name, amount: -val }));

    const creditors = Object.entries(balances)
      .filter(([_, val]) => val > 0.01)
      .map(([name, val]) => ({ name, amount: val }));

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const settled = Math.min(debtors[i].amount, creditors[j].amount);
      if (settled > 0.5) {
        debts.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: Math.round(settled),
        });
      }
      debtors[i].amount -= settled;
      creditors[j].amount -= settled;

      if (debtors[i].amount < 0.5) i++;
      if (creditors[j].amount < 0.5) j++;
    }

    res.json({
      group,
      expenses,
      balances,
      debts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching group details", error });
  }
};

export const addGroupExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paidBy, title, amount, splits } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    const expense = await GroupExpense.create({
      groupId: id,
      paidBy,
      title,
      amount,
      splits,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error adding group expense", error });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Group.findByIdAndDelete(id);
    await GroupExpense.deleteMany({ groupId: id });
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting group", error });
  }
};
