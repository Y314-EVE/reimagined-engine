import express from "express";
import { AuthController } from "../controllers";

const router = express.Router();

router.get("/user-listALL", AuthController.listAll);

export default router;
