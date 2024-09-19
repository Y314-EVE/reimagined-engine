import express from "express";
import { AuthController } from "../controllers";
import auth from "../middleware/auth";
import { registerValidation } from "../middleware/registerValidation";

const router = express.Router();
// For testing ONLY
router.get("/user-listALL", AuthController.listAll);

router.post("/register", registerValidation, AuthController.registration);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.put("/change-password", auth, AuthController.changePassword);

export default router;
