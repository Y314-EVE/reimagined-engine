import mongoose, { Document, Schema } from "mongoose";

// Define the Break interface for breaks
interface IBreak {
  start: number; // Start time of the break
  end: number;   // End time of the break
}

// Define the FinishingTime interface
interface IFinishingTime {
  time: number;         // Finishing time of the exercise
  exerciseName: string; // Name of the finished exercise
}

// Define the ExerciseRecord interface
interface IExerciseRecord {
  targetExercise: mongoose.Types.ObjectId; // Reference to the target exercise plan
  finishedExercise: mongoose.Types.ObjectId; // Reference to the finished exercise plan
  timeRecord: {
    start_time: number;          // Start time of the exercise
    finishing_times: IFinishingTime[]; // Array of finishing times and names
    breaks?: IBreak[];           // Array of breaks
    end_time?: number;           // Optional: Time when the session ends
  };
}

// Define the UserRecord interface
interface IUserRecord extends Document {
  _id: {
    type: Schema.Types.ObjectId,
    auto: true, // Automatically generate an ObjectId
  },
  _user_id:mongoose.Types.ObjectId,
  exerciseRecord: IExerciseRecord[]; // Array of exercise records
}

// Define the UserRecord schema
const userRecordSchema = new Schema<IUserRecord>({
     //for applying email recording
  /*email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },*/
  _user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseRecord: [{
    targetExercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExercisePlan', // Reference to the ExercisePlan model
      required: true,
    },
    finishedExercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExercisePlan',
      required: true,
    },
    timeRecord: {
      start_time: {
        type: Number,
        required: true,
      },
      finishing_times: [{
        time: {
          type: Number,
          required: true,
        },
        exerciseName: {
          type: String,
          required: true,
        },
      }],
      breaks: [{
        start: {
          type: Number,
          required: true,
        },
        end: {
          type: Number,
          required: true,
        },
      }],
      end_time: {
        type: Number,
        required: true
      },
    },
  }],
}, { versionKey: false });

// Create the UserRecord model
const UserRecord = mongoose.model<IUserRecord>("UserRecord", userRecordSchema);
export default UserRecord;