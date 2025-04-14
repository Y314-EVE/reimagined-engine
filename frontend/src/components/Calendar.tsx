import React, { useEffect, useState } from 'react';
import './Calendar.css';
import Exercise_List from '../Exercise';
import SidePanel from './SidePanel';
import { useNavigate } from 'react-router';
import { tokenUpdate } from "../helpers";
import axios from 'axios';
import { TopBar } from '.';
// Base URL for the API
const API_URL = 'http://localhost:5003/api/exercise';

// Represents a break taken during an exercise session
interface IBreak {
    start: number; // Start time of the break in minutes
    end: number;   // End time of the break in minutes
  }
  
  // Represents the finishing time of an exercise
  interface IFinishingTime {
    time: number;         // Finishing time in minutes
    exerciseName: string; // Name of the finished exercise
  }
  
  // Represents the workout scheduling
  interface IWorkoutTime {
    type: 'specific' | 'period' | 'no_specific'; // Type of workout time
    days?: string[]; // Optional: Array of days for 'period'
    date?: Date;    // Optional: Date for 'specific'
  }
  
  // Represents an individual exercise
  interface IExercise {
    name: string;          // Name of the exercise
    requiredTool: boolean; // Optional: Indicates if a specific tool is required
    weight: number;
    frequencyOrDuration: number;      // Duration of the exercise in minutes
    
    type: string;          // Type of exercise (e.g., strength, cardio, etc.)
  }
  
  // Represents a user's exercise record
  interface IExerciseRecord {
    targetExercise: string; // ID of the target exercise plan
    finishedExercise: string; // ID of the finished exercise plan
    timeRecord: {
      start_time: number;           // Start time of the exercise in minutes
      finishing_times: IFinishingTime[]; // Array of finishing times
      breaks?: IBreak[];            // Optional: Array of breaks
      end_time?: number;            // Optional: End time in minutes
    };
  }
  
  // Represents a user's exercise records
  interface IUserRecord {
    _user_record?: string;
    exerciseRecord: IExerciseRecord[]; // Array of exercise records
  }
  
  // Represents an exercise plan
  interface IExercisePlan {
    _id ?: string; 
    _user_id ?: string;
    exercises: {
      exercise: IExercise;        // Details of the exercise
    }[];
    workoutTime: IWorkoutTime;  // Scheduling details for the workout
    createdAt: Date;              // Timestamp of when the plan was created
  }



// Extract unique exercise types
const uniqueExerciseTypes = [...new Set(Exercise_List.map(exercise => exercise.exerciseType))];

// Append 'All' to the unique exercise types
const completeExerciseTypes = ['All', ...uniqueExerciseTypes];


  
export const getAllUserRecords = async () => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");

  try {
    const response = await axios.get<IUserRecord[]>(`${API_URL}/user-records-get`, { headers: { Authorization: token } },);
    return response.data;
  } catch (error) {
    console.error("Error fetching user records:", error);
    throw error;
  }
};

export const appendUserRecord = async (userRecord: IUserRecord) => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");

  try {
    const response = await axios.post<IUserRecord[]>(`${API_URL}/user-records-append`, userRecord, { headers: { Authorization: token } },);
    return response.data; // Returns updated list of user records
  } catch (error) {
    console.error("Error appending user record:", error);
    throw error;
  }
};

export const getAllExercisePlans = async () => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");

  try {
    const response = await axios.get<IExercisePlan[]>(`${API_URL}/exercise-plans-get`,
    {
      headers: {
        Authorization: token,
      },
    },
  );
    return response.data;
  } catch (error) {
    console.error("Error fetching exercise plans:", error);
    throw error;
  }
};

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

/*export const modifyExercisePlan = async (id: string, exercisePlan: IExercisePlan) => {
  try {
    const response = await axios.put<IExercisePlan>(`${API_URL}/exercise-plans/${id}`, exercisePlan);
    return response.data; // Returns the updated exercise plan
  } catch (error) {
    console.error("Error modifying exercise plan:", error);
    throw error;
  }
};
*/

export const deleteExercisePlan = async (id: string) => {
    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");
  try {
    await axios.delete(`${API_URL}/exercise-plans-delete/${id}`, { headers: { Authorization: token } },);
    return { message: "Exercise plan deleted successfully" }; // Return a success message
  } catch (error) {
    console.error("Error deleting exercise plan:", error);
    throw error;
  }
};




  


const Modal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any[]) => void }> = ({ isOpen, onClose, onSubmit }) => {
    
    const [exerciseUnits, setExerciseUnits] = useState<Array<{ exerciseType: string; exerciseName: string; frequencyOrDuration: number; weight: number,requiredTool : boolean }>>([]);
    const [workoutTime, setWorkoutTime] = useState<IWorkoutTime>({
        type: 'specific',
        days: [],
        date: new Date(), // Initialize with current date
    });
    const handleWorkoutTimeChange = (type: 'specific' | 'period') => {
        setWorkoutTime({
            type,
            days: type === 'period' ? [] : workoutTime.days, // Reset days if switching to period
            date: type === 'specific' ? new Date() : undefined // Set date only if specific
        });
    };
    
    const handleAddExerciseUnit = () => {
        setExerciseUnits([...exerciseUnits, { exerciseType: '', exerciseName: '', frequencyOrDuration: 1, weight: 0, requiredTool:false }]);
    };

    const handleDeleteExerciseUnit = (index: number) => {
        const updatedUnits = exerciseUnits.filter((_, i) => i !== index);
        setExerciseUnits(updatedUnits);
    };

  
    const handleSubmit = async () => {
        const exercisePlan: IExercisePlan = {
           
            exercises: exerciseUnits.map(unit => ({
                
                exercise: {
                    
                    name: unit.exerciseName,
                    requiredTool: unit.requiredTool,
                    weight: unit.weight ,
                    frequencyOrDuration: unit.frequencyOrDuration,
                    type: unit.exerciseType,
                },
                
            })),
            workoutTime: {
                type: workoutTime.type,
                days: workoutTime.type === 'period' ? workoutTime.days : undefined,
                date: workoutTime.type === 'specific' ? workoutTime.date : undefined,
            },
            createdAt: new Date(),
        };
        try {
            console.log(exercisePlan);
            await createExercisePlan(exercisePlan);
            
            onClose(); // Close the modal

            window.location.reload(); // Refresh the page to see updated data
            
        } catch (error) {
            console.error("Submission Error:", error);
            // Alert user about failure
        }
    };
    
    // Function to render frequency or duration input
    const frequencyOrDurationField = (unit, index) => {
        const exercise = Exercise_List.find(ex => ex.exerciseName === unit.exerciseName);
        const isFrequency = exercise && exercise.frequencyOrDuration === 'frequency';
    
        return (
            <div style={{ display: 'flex', alignItems: 'center', width: 'auto' }}>
                {isFrequency ? (
                    <input
                        type="number"
                        value={unit.frequencyOrDuration} // Directly shows the frequency count
                        onChange={(e) => {
                            const updatedUnits = [...exerciseUnits];
                            const value = Number(e.target.value);
                            updatedUnits[index].frequencyOrDuration = value >= 1 ? value : 1; // Min is 1
                            setExerciseUnits(updatedUnits);
                        }}
                        min="1" // Minimum of 1 for frequency
                        placeholder="Frequency"
                        style={{ width: '80px', padding: '8px', boxSizing: 'border-box' }} // Fixed width
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={Math.floor(unit.frequencyOrDuration / 60)} // Minutes
                            onChange={(e) => {
                                const updatedUnits = [...exerciseUnits];
                                const minutes = Number(e.target.value);
                                const seconds = unit.frequencyOrDuration % 60; // Keep existing seconds
                                updatedUnits[index].frequencyOrDuration = (minutes * 60) + seconds; // Update total seconds
                                setExerciseUnits(updatedUnits);
                            }}
                            min="0" // Allow minutes to be 0
                            placeholder="Min"
                            style={{ width: '60px', padding: '8px', boxSizing: 'border-box', marginRight: '5px' }} // Fixed width
                        />
                        <span>:</span>
                        <input
                            type="number"
                            value={unit.frequencyOrDuration % 60} // Seconds
                            onChange={(e) => {
                                const updatedUnits = [...exerciseUnits];
                                const seconds = Number(e.target.value);
                                const minutes = Math.floor(unit.frequencyOrDuration / 60); // Keep existing minutes
                                updatedUnits[index].frequencyOrDuration = (minutes * 60) + (seconds >= 0 ? seconds : 0); // Update total seconds
                                setExerciseUnits(updatedUnits);
                            }}
                            min="0" // Allow seconds to be 0
                            placeholder="Sec"
                            style={{ width: '60px', padding: '8px', boxSizing: 'border-box', marginLeft: '5px' }} // Fixed width
                        />
                    </div>
                )}
            </div>
        );
    };





const weightField = (unit, index) => {
    // Find the exercise based on the exercise name
    const exercise = Exercise_List.find(ex => ex.exerciseName === unit.exerciseName);
    const isToolRequired = exercise?.toolRequired ?? false;
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
                type="number"
                value={unit.weight}
                onChange={(e) => {
                    const value = Number(e.target.value);
                    const updatedUnits = [...exerciseUnits];
                    if (value >= 0) {
                        updatedUnits[index].weight = value;
                    }
                    updatedUnits[index].requiredTool = isToolRequired;

                    setExerciseUnits(updatedUnits);
                }}
                placeholder="Weight (required)"
                min="0"
                disabled={!isToolRequired} // Disable input if toolRequired is false
                style={{ width: '80px', padding: '8px', boxSizing: 'border-box' }} // Set fixed width
            />
            <span style={{ marginLeft: '5px' }}>kg</span> {/* Add unit label */}
        </div>
    );
};
        if (!isOpen) return null;
    
        return (
            
                 <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Add Exercise</h2>

                <div className="form-row">
                    <select onChange={(e) => handleWorkoutTimeChange(e.target.value as 'specific' | 'period')} value={workoutTime.type}>
                        <option value="specific">Specific Date</option>
                        <option value="period">Period</option>
                    </select>
                </div>
                <div className="form-row">
                    <label>{workoutTime.type === 'specific' ? 'Date:' : 'Days:'}</label>
                </div>
                <div className="form-row">
                    {workoutTime.type === 'specific' ? (
                        <input 
                            type="date" 
                            value={workoutTime.date?.toISOString().slice(0, 10)} // Convert to string for input
                            onChange={(e) => setWorkoutTime({ ...workoutTime, date: new Date(e.target.value) })} // Convert string to Date
                        />
                    ) : (
                        <div>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
    <button
        key={day}
        className={`day-button ${workoutTime.days?.includes(day) ? 'selected' : ''}`} // use optional chaining
        onClick={() => {
            const updatedDays = (workoutTime.days || []).includes(day) // Ensure to handle undefined
                ? (workoutTime.days || []).filter(d => d !== day)
                : [...(workoutTime.days || []), day]; // Use default empty array
            setWorkoutTime({ ...workoutTime, days: updatedDays });
        }}
    >
        {day}
    </button>
))}
                        </div>
                    )}
                </div>

                    <div className="form-row">
                        <label>Exercise Type:</label>
                        <label>Exercise Name:</label>
                        <label>Frequency:</label>
                        <label>Weight:</label> 
                        <label></label> 
                    </div>
    
                    <div className="exercise-units" style={{ maxHeight: '300px', overflowY: exerciseUnits.length > 6 ? 'auto' : 'hidden' }}>
                        {exerciseUnits.map((unit, index) => (
                            <div className="form-row" key={index}>
                                <select onChange={(e) => {
                                    const updatedUnits = [...exerciseUnits];
                                    updatedUnits[index].exerciseType = e.target.value;
                                    setExerciseUnits(updatedUnits);
                                }} value={unit.exerciseType}>
                                    <option value="">Select Type</option>
                                    {completeExerciseTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                                </select>
                                <select onChange={(e) => {
                                    const updatedUnits = [...exerciseUnits];
                                    updatedUnits[index].exerciseName = e.target.value;
    
                                            // Find the corresponding exercise type based on the selected exercise name
                const selectedExercise = Exercise_List.find(exercise => exercise.exerciseName === e.target.value);
                if (selectedExercise) {
                    updatedUnits[index].exerciseType = selectedExercise.exerciseType; // Update exercise type
                
                }
                                    setExerciseUnits(updatedUnits);
                                }}
                                
                                value={unit.exerciseName} disabled={!unit.exerciseType}>
                                     <option value="">Select Exercise</option>
            {unit.exerciseType === 'All'
                ? Exercise_List.map(exercise => (
                    < option key={exercise.exerciseName} value={exercise.exerciseName}>{exercise.exerciseName}</option>
                    ))
                : Exercise_List.filter(exercise => exercise.exerciseType === unit.exerciseType).map(exercise => (
                    <option key={exercise.exerciseName} value={exercise.exerciseName}>{exercise.exerciseName}</option>
                    ))}
                    </select>
                    {frequencyOrDurationField(unit, index)}
    
                                {weightField(unit, index)}
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteExerciseUnit(index)}
                                    style={{ color: 'red' }}
                                >
                                    - {/* Delete button symbol */}
                                </button>
                            </div>
                        ))}
                    </div>

                   
                    <div className="modal-buttons">
                        <button onClick={handleAddExerciseUnit} className="add-exercise-button">Add Exercise</button>
                        <button 
                            onClick={handleSubmit} 
                            className="done-button" 
                            disabled={
                                exerciseUnits.some(unit =>
                                { if (unit.exerciseType === '' || unit.exerciseName === '') return true;

                            // Find the corresponding exercise from the Exercise_List
                            const exercise = Exercise_List.find(ex => ex.exerciseName === unit.exerciseName);
                            
                            // Determine if weight is necessary
                            const isToolRequired = exercise && exercise.toolRequired;
                            
                            // Disable if weight is not set when a tool is required
                            return (isToolRequired && unit.weight <= 0);}
                            )} 
                            style={{ backgroundColor: exerciseUnits.length > 0 ? '#4CAF50' : '#ccc' }} 
                        >
                            Done
                        </button>
                        <button onClick={onClose} className="leave-button">Leave</button>
                    </div>
                </div>
            </div>
        );
    };
  
    


    interface ExercisePlansListProps {
        workoutTime?: IWorkoutTime; // Here, you're expecting an `IWorkoutTime` object
    }




    const ExercisePlansList: React.FC<ExercisePlansListProps> = ({ workoutTime }) => {
        const [exercisePlans, setExercisePlans] = useState<IExercisePlan[]>([]); // State to hold fetched exercise plans
        const [selectExercisePlans, setSelectExercisePlans] = useState<IExercisePlan[]>([]); // State to hold fetched exercise plans
        const [loading, setLoading] = useState(true); // State to manage loading state
        const [error, setError] = useState<string | null>(null); // State to hold error messages
        const navigate = useNavigate();
        const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null); // Track selected exercise plan ID
        const [filterPlans, setFilterPlans] = useState<IExercisePlan[]>([])
        const [isFiltered, setIsFiltered] = useState<boolean>(false); // State to track if we are showing today's plans
        const [toggle,setToggle] = useState<number>(0);
        const [selectedDay, setSelectedDay] = useState<string>("None")
        const handleExerciseSelect = (exercise : IExercisePlan) => {
            // Navigate to ExerciseTracker and pass the selected exercise plan as state
            
            navigate('/exercise-tracker', { state: { exercisePlan: exercise } });
        };
        
        const getFrequencyOrDurationByExerciseName = (exerciseName: string) => {
            // Use find to get the exercise object by name
            const exercise = Exercise_List.find(exercise => exercise.exerciseName === exerciseName);
            
            // If the exercise is found, return its frequencyOrDuration
            if (exercise) {
                return exercise.frequencyOrDuration;
            } else {
                return null; // Return null if the exercise is not found
            }
        };

        const formatTime = (seconds: number) => {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}min : ${secs}sec`;
        };
        

        

        const handleDeletePlan = async (id: string) => {
            try {
                const response = await deleteExercisePlan(id);
                console.log(response.message); // Optionally handle success feedback to user
                // Optionally update the state here to remove the deleted plan from the UI
                setExercisePlans(prevPlans => prevPlans.filter(plan => plan._id !== id));

            } catch (error) {
                console.error("Error deleting exercise plan:", error);
                // You may want to notify the user about the failure
            }
        };

        
        const handleFilterPlans = (workTime?: IWorkoutTime) => {
            if(workTime === undefined) return false;
            const filteredPlans = exercisePlans.filter(plan => {
                // For specific type
                if (workTime.type === 'specific' && workTime.date) {
                    const workDate = new Date(workTime.date);
                    const planDate = plan.workoutTime.date ? new Date(plan.workoutTime.date) : undefined; // Check if plan date exists
                   
                    // Compare year, month, and day
                    return (
                       ( plan.workoutTime.type === 'specific' && 
                        planDate && // Ensure planDate is defined
                        planDate.getFullYear() === workDate.getFullYear() &&
                        planDate.getMonth() === workDate.getMonth() &&
                        planDate.getDate() === workDate.getDate())
                        || (

                            (plan.workoutTime.type === 'period' && 
                            plan.workoutTime.days && 
                            plan.workoutTime.days.includes(new Date(workTime.date).toLocaleString('en-US', { weekday: 'long' }))) 
                        )
                    );
                }
                // For period type
                else if (workTime.type === 'period' && workTime.days) {
                    // Get the day of the week for the specific date
                   

                   
                    return (
                        // Check if the plan has a period type workout time and if any of the plan's days match workTime.days
                        (plan.workoutTime.type === 'period' && 
                         plan.workoutTime.days && 
                         plan.workoutTime.days.some(day => workTime.days!.includes(day))) ||
                        // Check if there's a specific type and if the weekday matches
                        (plan.workoutTime.type === 'specific' && 
                         plan.workoutTime.date && 
                         workTime.days!.includes(new Date(plan.workoutTime.date).toLocaleString('en-US', { weekday: 'long' })))
                    );
                }
                return false; // Return false if no condition matched
            });
    
            // Update the state with filtered plans
            setFilterPlans(filteredPlans);
            return true;
        };
        
   

        useEffect(() => {

            const fetchExercisePlans = async () => {
                try {
                    const plans = await getAllExercisePlans();
                    
                    
                    setExercisePlans(plans); // Update state with fetched plans
                   
                    if(!handleFilterPlans(workoutTime))
                    {setFilterPlans(exercisePlans);
                   
                    
                    }


                } catch (err) {
                    setError("Failed to load exercise plans."); // Handle error
                    console.error(err);
                } finally {
                    setLoading(false); // Update loading state
                }
            };
    
            fetchExercisePlans(); // Call the function to fetch data

        }, []); // Empty array means this effect runs once on component mount
    
        useEffect(() => {
            // If workoutTime or exercisePlans change, re-filter the plans
            if (exercisePlans.length > 0) {
                if(!handleFilterPlans(workoutTime))
                    {setFilterPlans(exercisePlans);
                      
                    }
               
            }



        }, [workoutTime, exercisePlans]); // Re-run this effect when workoutTime or exercisePlans change
        
        useEffect(() => {
            // If workoutTime or exercisePlans change, re-filter the plans
            if(workoutTime === undefined)
            {setSelectedDay("All");}
            if(workoutTime !== undefined){
                        
                if(workoutTime!.type === "specific")
                {
                        setSelectedDay(`${workoutTime!.date!.toLocaleDateString()}`)

                }
                else if(workoutTime!.type === "period")
                {
                    setSelectedDay(`${workoutTime!.days!.join(`, `)}`)
                }
            }
             
            


        }, [workoutTime]); // Re-run this effect when workoutTime or exercisePlans change
        

        
        // Render loading state
        if (loading) {
            return <div>Loading exercise plans...</div>;
        }
    
        // Render error state
        if (error) {
            return <div>{error}</div>;
        }

        
        
   
        

        const handleSelectPlan = (planId: string) => {
            // Select or deselect an exercise plan
            setSelectedPlanId(prevId => (prevId === planId ? null : planId));
        };
        
        const handleExerciseListing = (exercisePlans: IExercisePlan[]) => {
            return (
                <>
                    {exercisePlans.map((plan) => {
                        // Log the raw date for debugging
                        const rawDate = plan.workoutTime.date; 
                        
                        let workoutTimeDisplay;
        
                        if (plan.workoutTime.type === 'specific') {
                            // Check if rawDate is defined and not null
                            if (rawDate !== undefined && rawDate !== null) {
                                const date = new Date(rawDate); // Create a Date object from the raw date
                                
                                // Check if the date is valid
                                if (date instanceof Date && !isNaN(date.getTime())) {
                                    workoutTimeDisplay = date.toLocaleDateString(); // Valid date
                                } else {
                                    workoutTimeDisplay = 'Invalid Date'; // Handle invalid date
                                }
                            } else {
                                workoutTimeDisplay = 'No Date'; // Handle case where rawDate is undefined or null
                            }
                        } else if (plan.workoutTime.type === 'period') {
                            workoutTimeDisplay = Array.isArray(plan.workoutTime.days) && plan.workoutTime.days.length > 0 
                                ? plan.workoutTime.days.join(', ') 
                                : 'No Days'; // Handle case where days is undefined or empty
                        } else {
                            workoutTimeDisplay = 'None';
                        }
        
                        return (
                            <div
                                key={plan._id}
                                className={`exercise_list_item ${selectedPlanId === plan._id ? 'selected' : ''}`} 
                            >
                                <div className="exercise_list_content" onClick={() => handleSelectPlan(plan._id!)}>
                                    
                                    
                                    <strong>Workout Time:</strong> {workoutTimeDisplay}<br/>
                                    <strong>Exercises:</strong>
                                    <ul>
                                        {plan.exercises.map((ex, exIndex) => (
                                            <li key={exIndex}>
                                                {ex.exercise.name} - {getFrequencyOrDurationByExerciseName(ex.exercise.name)} - {
                                                    getFrequencyOrDurationByExerciseName(ex.exercise.name) === 'frequency' 
                                                        ? `${ex.exercise.frequencyOrDuration} time `
                                                        : formatTime(ex.exercise.frequencyOrDuration)
                                                }  {ex.exercise.requiredTool ? `- ${ex.exercise.weight} kg` : ""}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    className="delete_button"
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleDeletePlan(plan._id as string); 
                                    }}
                                >
                                    - {/* Minus symbol for deletion */}
                                </button>
                            </div>
                        );
                    })}
                </>
            );
        };

        return (
            <div className="exercise_list_container">
                <header className="exercise_list_header">
                    <h1 onClick={() => {setFilterPlans(exercisePlans); setSelectedDay("All")} } style={{ cursor: 'pointer' }}>Exercise Plans</h1>
                </header>
                <h1 style={ {fontSize : '20px'}}>{"sort: " + selectedDay}</h1>
                <div className="exercise_list_body">
        {
            handleExerciseListing(filterPlans)
        }
    </div>
                <footer className="exercise_list_footer">
                    <button
                        onClick={() => {
                            const selectedPlan = exercisePlans.find(plan => plan._id === selectedPlanId);
                            
                            if (selectedPlan) {
                                handleExerciseSelect(selectedPlan);
                            }
                        }}
                        disabled={!selectedPlanId} // Disable button if no plan is selected
                    >
                        Start Exercise Tracker
                    </button>
                </footer>
            </div>
        );
    
        };
        
    


    const Calendar: React.FC = () => {
        const [currentDate, setCurrentDate] = useState(new Date());
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [exercisesList, setExercisesList] = useState<IExercisePlan[]>([]); // Store submitted exercise settings
        const [loading, setLoading] = useState(true); // State to manage loading state
        const [error, setError] = useState<string | null>(null); // State to hold error messages
        const [ ClickDate, setClickDate] = useState<IWorkoutTime>();
    
        
   // Log ClickDate whenever it changes
   useEffect(() => {
    console.log(ClickDate);
}, [ClickDate]); 

        const changeMonth = (increment: number) => {
            const newDate = new Date(currentDate);
            newDate.setMonth(currentDate.getMonth() + increment);
            setCurrentDate(newDate);
        };
    
        const addExercise = (data: any) => {
            setExercisesList([...exercisesList, ...data]); // Spread to handle multiple exercises
        };
    
        const renderDays = () => {
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
            const days = [];
            for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${i}`} className="day" style={{ visibility: 'hidden' }} />);
            }
    
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateString = date.toISOString().slice(0, 10);
                const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    
                days.push(
                    <div 
                        key={day}
                        className="day"
                        onClick={() => {
                            setClickDate({
                                type: 'specific',
                                date: date, // Store the clicked date
                                days: undefined, // Set days to undefined as per your requirement
                            });
                           
                        }}
                    >
                        {day}
                    </div>
                );
            }
    
            return days;
        };
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
       
      // Mapping of short forms to full day names
    const dayMapping: Record<string, string> = {
        Sun: 'Sunday',
        Mon: 'Monday',
        Tue: 'Tuesday',
        Wed: 'Wednesday',
        Thu: 'Thursday',
        Fri: 'Friday',
        Sat: 'Saturday'
    }; 
        const [width, setWidth] = useState(70); // Initial width of left panel (70%)

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const startX = e.clientX;

        const mouseMoveHandler = (e: MouseEvent) => {
            const newWidth = Math.max(20, Math.min(100, 100 - ((startX - e.clientX) * 100 / window.innerWidth)));
            setWidth(newWidth);
        };

        const mouseUpHandler = () => {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
        };

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
    };

        return (
          
            <div className = "schedule"> 
            <TopBar mode="schedule" /> 
            <div className="resizable-container">
            <div className="left-panel" style={{ width: `${width}%` }}> {}
             
             {
                 
                 <div className="calendar">
                   
                     <div className="header">
                     <button onClick={() => changeMonth(-1)}>&lt;</button>
                     <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                     <button onClick={() => changeMonth(1)}>&gt;</button>
                     <button onClick={() => setIsModalOpen(true)} className="add-button">+</button>
                     </div>
                     
                     <div className="weekdays">
    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div 
            key={day} 
            className="weekday" 
            onClick={() => {
                setClickDate({
                    type: 'period',
                    date: undefined, // Store the clicked date
                    days: [dayMapping[day]], // Store the selected day in an array
                });
                
            }}
        >
            {day}
        </div>
    ))}
</div>
     
                     <div className="days">
                     {renderDays()}
                     </div>
                     
                     <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={addExercise} />
                 
                 </div>
         }
         </div>
     
             <div className="divider" onMouseDown={handleMouseDown} />
                 <div className="right-panel">
                     { <ExercisePlansList  workoutTime={ClickDate} />}
                 </div>
             </div>
         </div>
     
     
     
     
             );
         };
         
         
         
         export default Calendar;