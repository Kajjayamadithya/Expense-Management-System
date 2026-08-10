import express from "express";
import { protect } from "../middleware/authMiddleware";
import { chatWithAI, parseNaturalLanguageTransaction, scanReceipt } from "../controllers/aiController";

const router = express.Router();

router.post("/chat", protect, chatWithAI);
router.post("/parse", protect, parseNaturalLanguageTransaction);
router.post("/scan-receipt", protect, scanReceipt);

export default router;
