import express from "express";
import { PromptController } from "../controllers";

const router = express.Router();

router.post("/prompt-generate", PromptController.generate);
router.post("/prompt-chat", PromptController.chat);

export default router;
