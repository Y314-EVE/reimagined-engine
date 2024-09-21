import express from "express";
import auth from "../middleware/auth";
import { MessageController } from "../controllers";

const router = express.Router();

router.get("/list-messages", auth, MessageController.listMessages);
router.get("/get-message", auth, MessageController.getMessage);
router.post("/create", auth, MessageController.create);
router.put("/get-response", auth, MessageController.getResponse);
router.post("/delete", auth, MessageController.delete);

export default router;
