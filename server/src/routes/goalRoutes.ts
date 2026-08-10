import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getGoals, createGoal, depositToGoal, deleteGoal } from "../controllers/goalController";

const router = express.Router();

router.get("/", protect, getGoals);
router.post("/", protect, createGoal);
router.patch("/:id/deposit", protect, depositToGoal);
router.delete("/:id", protect, deleteGoal);

export default router;
