import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getGroups,
  createGroup,
  getGroupDetails,
  addGroupExpense,
  deleteGroup,
} from "../controllers/groupController";

const router = express.Router();

router.get("/", protect, getGroups);
router.post("/", protect, createGroup);
router.get("/:id", protect, getGroupDetails);
router.post("/:id/expenses", protect, addGroupExpense);
router.delete("/:id", protect, deleteGroup);

export default router;
