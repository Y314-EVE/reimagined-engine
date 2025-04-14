import React, { useEffect, useState } from 'react';
import './ExerciseTracker.css'; // Import the CSS file
import Exercise_List from '../Exercise';
import axios from 'axios';
import { tokenUpdate } from "../helpers";
import { useLocation, Navigate } from 'react-router';
// Base URL for the API
const API_URL = 'http://localhost:5003/api/exercise';

export const createExercisePlan = async (
   
    exercisePlan: Omit<IExercisePlan, '_id' | '_user_id' >
) => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");
    
    try {
        console.log("Sending exercise plan:", JSON.stringify(exercisePlan, null, 2));
        const response = await axios.post<IExercisePlan>(
            `${API_URL}/exercise-plans-create`,
            exercisePlan
            ,
            { headers: { Authorization: token } },
          );
        console.log("Response:", response.data);
        const { _id: id, createdAt, exercises } = response.data; // Assuming the backend returns _id
        return { id, createdAt, exercises };
    } catch (error: unknown) { // Specify the error as `unknown`
        console.error("Error creating exercise plan:", error);

        if (axios.isAxiosError(error)) {
            // Now TypeScript knows that `error` can have `response` property
            console.error("Server responded with:", error.response?.data);
            console.error("HTTP Status Code:", error.response?.status);
        } else {
            // Handle unexpected errors (not related to Axios)
            console.error("Unexpected error:", error);
        }

        throw error;  // Rethrow the error for further handling if needed
    }
};

export const appendUserRecord = async (userRecord: Omit<IUserRecord, '_user_id'>) => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");
    
    console.log("userrecord",userRecord);
  try {
    const response = await axios.post<IUserRecord[]>(`${API_URL}/user-records-append`, userRecord, { headers: { Authorization: token } },);
    return response.data; // Returns updated list of user records
  } catch (error) {
    console.error("Error appending user record:", error);
    throw error;
  }
};

// Interfaces
interface IBreak {
    start: number; // Start time of the break in seconds
    end: number;   // End time of the break in seconds
}

interface IFinishingTime {
    time: number;         // Finishing time in seconds
    exerciseName: string; // Name of the finished exercise
}

interface IWorkoutTime {
    type: 'specific' | 'period' | 'no_specific'; 
    days?: string[];
    date?: Date;
}



interface IExercise {
    name: string;          
    requiredTool: boolean; 
    weight: number;
    frequencyOrDuration: number;
    type: string;          
}

interface IExercisePlan {
    _id ?: string; 
    _user_id?:string;
    
    exercises: {
        exercise: IExercise;        
    }[];
    workoutTime: IWorkoutTime;  
    createdAt: Date; // The creation date
}


interface IExerciseRecord {
    finish_time: Date;
    targetExercise: string; // ID of the target exercise plan
    finishedExercise: string; // ID of the finished exercise plan
    timeRecord: {
      start_time: number;           // Start time of the exercise in minutes
      finishing_times: IFinishingTime[]; // Array of finishing times
      breaks?: IBreak[];            // Optional: Array of breaks
      end_time?: number;            // Optional: End time in minutes
    };
  }
  

interface IUserRecord {
    _user_id ?: string;
    exerciseRecord: IExerciseRecord[]; // Array of exercise records
  }
  


// Main component
const ExerciseTracker: React.FC<{ exercisePlan: IExercisePlan }> = ({ exercisePlan }) => {
    const [userPlan, setUserPlan] = useState<IExerciseRecord>();
    const [finishingTimes, setFinishingTimes] = useState<IFinishingTime[]>([]);
    const [breaks, setBreaks] = useState<IBreak[]>([]);
    const [isBreakActive, setIsBreakActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0); // Timer for exercise
    const [isExerciseActive, setIsExerciseActive] = useState(true);
 

    const [DoneExercise, setDoneExercise] = useState<IExercisePlan>({
       
        exercises: [],
        workoutTime: {type : 'no_specific',
    date : undefined, days : undefined},
        createdAt: new Date(),
    });
    const [exerciseUnits, setExerciseUnits] = useState<IExercisePlan>(JSON.parse(JSON.stringify(exercisePlan)));
    const [completedExercises, setCompletedExercises] = useState<any[]>([]); // Store completed exercises
    const [breakTimerSeconds, setBreakTimerSeconds] = useState(0);
    const [breakIntervalId, setBreakIntervalId] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null); // Store the start time

    
    useEffect(() => {
        let timer: number | undefined;

        if (isExerciseActive) {
            timer = setInterval(() => {
                setTimerSeconds((prev) => prev + 1); // Increment seconds every second
            }, 1000);
        } 

        return () => clearInterval(timer); // Cleanup interval on unmount or when isExerciseActive changes
    }, [isExerciseActive]); // Run effect when isExerciseActive changes

    

    const handleDoneExercise = (unit,index) => {
        const finishingTime = {
            time: timerSeconds,
            exerciseName: unit.exercise.name

        };

        const currentExercise: IExercise = {
            name: unit.exercise.name,
            requiredTool: unit.exercise.requiredTool,
            weight: unit.exercise.weight, // Taken from the current input
            frequencyOrDuration: unit.exercise.frequencyOrDuration, // Taken from the current input
            type: unit.exercise.type // Type based on the original exercise
        };

        
        const newDoneExercise = { exercise: currentExercise};
        setDoneExercise((prevPlan) => {
            const updatedExercises = [...prevPlan.exercises, newDoneExercise]; // Create a new exercises array
            return {
                ...prevPlan, // Spread the previous plan
                exercises: updatedExercises, // Update exercises with the new array
            };
        });
        

        setExerciseUnits((prevUnits) => ({
            ...prevUnits,
            exercises: prevUnits.exercises.filter((_, i) => i !== index), // Filter the exercises array
        }));


        setFinishingTimes((prev) => [...prev, finishingTime]);
    };

    const handleBreakToggle = () => {
        if (!isBreakActive) {
            // Start the break
            setIsBreakActive(true);
            setBreakTimerSeconds(0); // Reset the break timer
            setStartTime(timerSeconds); // Capture the main timer value as the start time

            // Start the break timer
            const id = setInterval(() => {
                setBreakTimerSeconds((prev) => prev + 1); // Increment break timer
            }, 1000);
            setBreakIntervalId(id); // Save the interval ID for cleanup
            
            console.log("Break started at second:", startTime);
        } else {
            // Stop the break
            if (breakIntervalId !== null) {
                clearInterval(breakIntervalId); // Clear break timer
            }

            // Record the end time based on the main timer and break duration
            const endTime = startTime! + breakTimerSeconds; // Use the main timer's start time

            // Add break entry
            setBreaks((prevBreaks) => [...prevBreaks, { start: startTime!, end: endTime }]);

            setIsBreakActive(false);
            setBreakTimerSeconds(0); // Reset break timer for next session

            console.log("Break ended at second:", endTime);
        }
    };





    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}min : ${secs}sec`;
    };


    const handleFinishExercise =async () => {
        console.log("finish exercise")
        setIsExerciseActive(false);
        // Prepare the time record
        const timeRecord = {
            start_time: 0,
            finishing_times: finishingTimes,
            breaks: breaks.length > 0 ? breaks : undefined,
            end_time: timerSeconds
        };
        

        try {
            const return_data = await createExercisePlan(DoneExercise);
            console.log("Return Data:", JSON.stringify(return_data, null, 2)); // Log the return data
            const EexerciseRecord : IExerciseRecord = 
            {
                targetExercise : "67e18d1c5d3e741e3301732c",
                finishedExercise : return_data.id as string,
                timeRecord : timeRecord,
                finish_time : new Date(),

            }
        
            const UserRecord : IUserRecord = { exerciseRecord:[EexerciseRecord]}

            await appendUserRecord(UserRecord);
            window.history.back(); 
    

            // Reset states and close modal
        } catch (error) {
            console.error("Submission Error:", error);
            // Alert user about failure
        }

    
       
    };

    return (
        <div> 
            <div className="timer-section">
                <div className="timer-display">
                    Time: {formatTime(timerSeconds)} {/* Displaying the timer */}
                </div>
                <div> {/* Wrapping the button and break timer */}
                    <button onClick={handleBreakToggle}>
                        {isBreakActive ? 'Stop Break' : 'Start Break'}
                    </button>
                    {isBreakActive && <h3>Break Timer: {formatTime(breakTimerSeconds)}</h3>} {/* Displaying break timer */}
                </div>
            </div>
    
            <div> 
                {exerciseUnits.exercises.map((unit, index) => {
                    const exercise = Exercise_List.find(ex => ex.exerciseName === unit.exercise.name);
                    const isFrequency = exercise?.frequencyOrDuration === 'frequency';
    
                    return (
                        <div key={index} style={{ marginBottom: '15px' }}>
                            <div>
                                <strong>{index + 1}. {exercise?.exerciseName}</strong>
                            </div>
                            
                            <div>
                                <span>Target: </span>
                                {isFrequency 
                                    ? <span>Frequency: {unit.exercise.frequencyOrDuration}</span>
                                    : <span>Duration: {Math.floor(unit.exercise.frequencyOrDuration / 60)} min {unit.exercise.frequencyOrDuration % 60} sec</span>
                                }
                            </div>
                            
                            <button onClick={() => handleDoneExercise(unit, index)} style={{ margin: '10px 0' }}>
                                Done
                            </button>
                        </div>

                       
                    );
                })}
            </div>

            <div>
                {<button onClick={handleFinishExercise} style={{ margin: '10px 0' }}>
    Finish Exercise
</button> }

            </div>
        </div>
    );

  
};




const TrackerDisplay: React.FC = () => {
    // Example exercise plan
    const location = useLocation();
    const { exercisePlan } = location.state || {}; // Safely destructure to avoid errors
    
    if (!exercisePlan) {
        // Redirect to Calendar if no exercisePlan was passed
       
        return <Navigate to="/calendar" />;
    }

    return (
        <div className="App">
            <h1>Exercise Tracking</h1>
            <ExerciseTracker exercisePlan={exercisePlan} />
        </div>

    );
};


export default TrackerDisplay