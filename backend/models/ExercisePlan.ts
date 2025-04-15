import mongoose, { Document, Schema } from "mongoose";


// Define a TypeScript interface for the WorkoutTime
interface IWorkoutTime {
  type: 'specific' | 'period' | 'no_specific'; //no_specific is for the schedule work for user favourate
  days?: string[]; // Optional, only for 'period'
  date?: Date; // Optional, only for 'specific'
}
// Define the WorkoutTime schema
const workoutTimeSchema = new Schema<IWorkoutTime>({
  type: {
    type: String,
    enum: ['specific', 'period', 'no_specific'],
    required: true,
  },
  days: {
    type: [String], // Array of days
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: function(this: IWorkoutTime) { return this.type === 'period'; },
  },
  date: {
    type: Date, // Specific date
    required: function(this: IWorkoutTime) { return this.type === 'specific'; },
  }
});


// Define the Exercise properties directly in the ExercisePlan schema
interface IExercise {
  name: string;
  requiredTool?: boolean;
  weight: number;
  frequencyOrDuration: number;
  
  type: string;
}

// Define the ExercisePlan schema
interface IExercisePlan extends Document {


  
  _id: {
    type: Schema.Types.ObjectId,
    auto: true, // Automatically generate an ObjectId
  },
  _user_id: Schema.Types.ObjectId;
  exercises: {
    exercise: IExercise; // Directly include exercise details
  }[];
  workoutTime: IWorkoutTime;
  createdAt: Date;
}

const exercisePlanSchema = new Schema<IExercisePlan>({
  _user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  exercises: [{
    exercise: {
      name: {
        type: String,
        required: true,
      },
      requiredTool: {
        type: Boolean,
      },
      weight: {
        type: Number
      },
      frequencyOrDuration: {
        type: Number,
        required: true,
      },
     
      type: {
        type: String,
        required: true,
      },
    },
  }],
  workoutTime: workoutTimeSchema, // Use the new workout time schema
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { versionKey: false });


const ExercisePlan = mongoose.model<IExercisePlan>("ExercisePlan", exercisePlanSchema);
export default ExercisePlan;


