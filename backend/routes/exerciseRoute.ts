import express from "express";
import auth from "../middleware/auth"
import {ExerciseController }from '../controllers'; 

const router = express.Router();

router.get("/user-records-get",auth,ExerciseController.getAllUserRecords);
router.post("/user-records-append",auth, ExerciseController.appendUserRecord);
router.get("/exercise-plans-get",auth, ExerciseController.getAllExercisePlans);
router.post("/exercise-plans-create",auth, ExerciseController.createExercisePlan);
router.patch("/edit-exercise-plan/:id",auth,ExerciseController.modifyExercisePlan);
router.delete("/exercise-plans-delete/:id",auth, ExerciseController.deleteExercisePlan);

router.get("/exercise-plans-get-lastest-finished",auth, ExerciseController.getLatestFinishedExercisePlan);

export default router;

