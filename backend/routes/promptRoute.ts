import express from "express";
import { PromptController } from "../controllers";

const router = express.Router();

router.post("/prompt-generate", PromptController.generate);

export default router;
