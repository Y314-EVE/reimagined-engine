import express from "express";
import auth from "../middleware/auth"
import {ExerciseController }from '../controllers'; 

const router = express.Router();

router.get("/user-records-get",auth,ExerciseController.getAllUserRecords);
router.post("/user-records-append",auth, ExerciseController.appendUserRecord);
router.get("/exercise-plans-get",auth, ExerciseController.getAllExercisePlans);
router.post("/exercise-plans-create",auth, ExerciseController.createExercisePlan);

router.delete("/exercise-plans-delete/:id",auth, ExerciseController.deleteExercisePlan);

export default router;

