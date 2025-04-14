
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
    finish_time:Date;
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



export const modifyExercisePlan = async (id: string, exercisePlan: Omit<IExercisePlan, '_id' | '_user_id' >) => {

    await tokenUpdate();
    const token = document.cookie.split("; ").reduce((prev, curr) => {
      const parts = curr.split("=");
      return parts[0] === "access_token" ? parts[1] : prev;
    }, "");

  try {
    const response = await axios.patch<IExercisePlan>(`${API_URL}/edit-exercise-plan/${id}`, exercisePlan, { headers: { Authorization: token } },);
    return response.data; // Returns the updated exercise plan
  } catch (error) {
    console.error("Error modifying exercise plan:", error);
    throw error;
  }
};


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




  


const Modal_Edit: React.FC<{ isOpen: boolean; onClose: () => void; edit_exercise_plan ?: IExercisePlan }> = ({ isOpen, onClose, edit_exercise_plan }) => {
    
     // Define the state with the desired structure
     const [exerciseUnits, setExerciseUnits] = useState<Array<{
        exerciseType: string; 
        exerciseName: string; 
        frequencyOrDuration: number; 
        weight: number; 
        requiredTool: boolean 
    }>>(
        edit_exercise_plan!.exercises.map(item => ({
            exerciseType: item.exercise.type,
            exerciseName: item.exercise.name,
            frequencyOrDuration: item.exercise.frequencyOrDuration,
            weight: item.exercise.weight,
            requiredTool: item.exercise.requiredTool  // Assuming None is equivalent to false
        }))
    );const [workoutTime, setWorkoutTime] = useState<IWorkoutTime>(edit_exercise_plan!.workoutTime);

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
            await modifyExercisePlan(edit_exercise_plan!._id as string,exercisePlan);
            
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
  
    
export default Modal_Edit;