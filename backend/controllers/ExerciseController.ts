import { Request, Response } from "express";
import UserRecord from "../models/UserRecord"; // Ensure this is correctly imported
import ExercisePlan from "../models/ExercisePlan";

class ExerciseController {

  // Fetch all user records
  public static async getAllUserRecords(req: Request, res: Response) {
    try {
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        

        const userRecords = await UserRecord.find({ _user_id: _id });
         res.status(200).json(userRecords);
    } else {
      return res.status(401).json({ message: "Unauthorized" }); // Handle case where user is not authenticated
    }
  }
  catch (error) {

      res.status(500).json({ message: "Error fetching user records", error });
    }
  }

  // Append a new user record
  public static async appendUserRecord(req: Request, res: Response) {
    try {
        // Expecting the whole user record object in the body
        if (typeof req.user !== "string") {
          const { _id } = req.user;
          
        const userRecord = await UserRecord.findOne({ _user_id: _id });
        // Handle case where the user record doesn't exist
      if (!userRecord) {
        const newUserRecord = new UserRecord({...req.body,
          _user_id: _id});
        const savedUserRecord = await newUserRecord.save();
        console.log("Saved Exercise Plan:", JSON.stringify(savedUserRecord, null, 2)); // Log saved plan
        res.status(201).json(savedUserRecord);
      }


      // Append new exercise record(s) to userRecord's exerciseRecord array
      // Ensure that req.body contains the exerciseRecord data
      else if (req.body.exerciseRecord && Array.isArray(req.body.exerciseRecord)) {
        userRecord.exerciseRecord.push(...req.body.exerciseRecord); // Append the incoming exercise records
         // Save the updated UserRecord
      const updatedUserRecord = await userRecord.save();

      // Respond with the updated user record
      res.status(200).json(updatedUserRecord);
      
      } else {
        return res.status(400).json({ message: "Invalid exercise record data" });
      }
      
    } else {
      return res.status(401).json({ message: "Unauthorized" }); // Handle case where user is not authenticated
    }
  } catch (error) {
        res.status(500).json({ message: "Error appending user record", error });
    }
}
  // Fetch all exercise plans
  public static async getAllExercisePlans(req: Request, res: Response) {
    try {

      if (typeof req.user !== "string") {
        const { _id } = req.user;
      const exercisePlans = await ExercisePlan.find({ _user_id: _id });
      res.status(200).json(exercisePlans);}
      else {
        return res.status(401).json({ message: "Unauthorized" }); // Handle case where user is not authenticated
      }
   
    } catch (error) {
      res.status(500).json({ message: "Error fetching exercise plans", error });
    }

  }

  // Create a new exercise plan
  /*public static async createExercisePlan(req: Request, res: Response) {
    try {
      console.log("test1:"+req.body); 
      const newExercisePlan = new ExercisePlan(req.body); // Expecting the whole exercise plan object in the body
      console.log("test2:"+newExercisePlan);
      const savedExercisePlan = await newExercisePlan.save();
      console.log(savedExercisePlan);
      res.status(201).json(savedExercisePlan);
    } catch (error) {
      res.status(500).json({ message: "Error creating exercise plan", error });
    }
  }
  */
  public static async createExercisePlan(req: Request, res: Response) {
    try {
      
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        console.log("Request Body:", JSON.stringify(req.body, null, 2)); // More readable format
        const newExercisePlan = new ExercisePlan({...req.body,
          _user_id: _id});
        console.log("New Exercise Plan:", JSON.stringify(newExercisePlan, null, 2)); // Log the new plan
        const savedExercisePlan = await newExercisePlan.save();
        console.log("Saved Exercise Plan:", JSON.stringify(savedExercisePlan, null, 2)); // Log saved plan
        res.status(201).json(savedExercisePlan);
    }
    else {
      return res.status(401).json({ message: "Unauthorized" }); // Handle unauthorized access
    }
  } catch (error) {
        console.error("Error creating exercise plan:", error); // Logging error details to console
        res.status(500).json({ message: "Error creating exercise plan", error });
    }
 }
 

  // Modify an existing exercise plan
  public static async modifyExercisePlan(req: Request, res: Response) {
    const { id } = req.params; // Extract ID from URL parameters
    try {
      const updatedExercisePlan = await ExercisePlan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updatedExercisePlan) {
        return res.status(404).json({ message: "Exercise plan not found" });
      }
      res.status(200).json(updatedExercisePlan);
    } catch (error) {
      res.status(500).json({ message: "Error modifying exercise plan", error });
    }
  }

  
  // Delete an exercise plan
  public static async deleteExercisePlan(req: Request, res: Response) {
    const { id } = req.params; // Extract ID from URL parameters
    try {
      const deletedExercisePlan = await ExercisePlan.findByIdAndDelete(id);
      if (!deletedExercisePlan) {
        return res.status(404).json({ message: "Exercise plan not found" });
      }
      res.status(200).json({ message: "Exercise plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting exercise plan", error });
    }
  }
  public static async getLatestFinishedExercisePlan(
    req: Request,
    res: Response,
  ) {
    try {
      if (typeof req.user !== "string") {
        const { _id } = req.user;
        const userRecord = await UserRecord.findOne({ _user_id: _id }).exec();
        const lastestFinishedExerciseRecord =
          userRecord?.exerciseRecord.at(-1)?.finishedExercise;
        if (!lastestFinishedExerciseRecord) {
          return res
            .status(404)
            .json({ message: "No finished exercise found" });
        } else{
          const exercisePlan = await ExercisePlan.findById(lastestFinishedExerciseRecord).exec();
        res.status(200).json(exercisePlan);
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        code: 500,
        message: "Internal server error.",
      });
    }
  }
}

export default ExerciseController;