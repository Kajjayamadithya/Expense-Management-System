import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getBudgets, setBudget, deleteBudget } from "../controllers/budgetController";

const router = express.Router();

router.get("/", protect, getBudgets);
router.post("/", protect, setBudget);
router.delete("/:id", protect, deleteBudget);

export default router;
