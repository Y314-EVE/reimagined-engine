import express from "express";
import { AuthController } from "../controllers";
import auth from "../middleware/auth";
import { registerValidation } from "../middleware/registerValidation";

const router = express.Router();

router.post("/user-info", auth, AuthController.userInfo);
router.post("/register", registerValidation, AuthController.registration);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.put("/change-password", auth, AuthController.changePassword);
router.put("/update-name", auth, AuthController.updateName);
router.post("/send-verification-email", AuthController.sendEmailVerification);
router.post("/send-reset-email", AuthController.sendResetEmail);
router.put("/reset-password", AuthController.resetPassword);
router.get("/verify-email/:token/:email", AuthController.verifyEmail);
router.put("/update-token-pair", auth, AuthController.updateTokenPair);

export default router;
