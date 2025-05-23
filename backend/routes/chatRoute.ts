import express from "express";
import auth from "../middleware/auth";
import { ChatController } from "../controllers";

const router = express.Router();

router.get("/list-chats", auth, ChatController.listChats);
router.post("/get-chat", auth, ChatController.getChat);
router.post("/create", auth, ChatController.create);
router.put("/delete", auth, ChatController.delete);
router.put("/change-title", auth, ChatController.changeTitle);

export default router;
