// data/workoutPrograms.js
export const workoutPrograms = {
    push: [
        { exerciseId: 'ex_push_001', name: 'Pec Deck', targetWeight: 150, targetReps: 5.5, unit: 'lbs', sets: 3, muscleGroup: 'Push', equipment: 'Machine' },
        { exerciseId: 'ex_push_002', name: 'Incline Chest Press', targetWeight: 50, targetReps: 6, unit: 'lbs', sets: 3, muscleGroup: 'Push', equipment: 'Machine' },
        { exerciseId: 'ex_push_003', name: 'Shoulder Press', targetWeight: 50, targetReps: 4.5, unit: 'lbs', sets: 3, muscleGroup: 'Push', equipment: 'Machine' },
        { exerciseId: 'ex_push_004', name: 'Triceps Extension', targetWeight: 100, targetReps: 8, unit: 'lbs', sets: 3, muscleGroup: 'Push', equipment: 'Machine' },
        { exerciseId: 'ex_push_005', name: 'Dips', targetWeight: 0, targetReps: 5, unit: 'bodyweight', sets: 3, muscleGroup: 'Push', equipment: 'Bodyweight' },
        { exerciseId: 'ex_push_006', name: 'Reverse Curls', targetWeight: 140, targetReps: 8, unit: 'lbs', sets: 3, muscleGroup: 'Push', equipment: 'Machine' },
        { exerciseId: 'ex_abs_001', name: 'Cable Crunch', targetWeight: 150, targetReps: 9, unit: 'lbs', sets: 3, muscleGroup: 'Abs', equipment: 'Machine' },
        { exerciseId: 'ex_cardio_001', name: 'Cardio', targetWeight: 0, targetReps: 30, unit: 'minutes', sets: 1, muscleGroup: 'Cardio', equipment: 'Machine' }
    ],
    
    pull: [
        { exerciseId: 'ex_pull_001', name: 'Pull-Ups', targetWeight: 15, targetReps: 5.5, unit: 'lbs', sets: 3, muscleGroup: 'Pull', equipment: 'Bodyweight' },
        { exerciseId: 'ex_pull_002', name: 'Lat Raise Machine', targetWeight: 13, targetReps: 5.5, unit: 'plate', sets: 3, muscleGroup: 'Pull', equipment: 'Machine' },
        { exerciseId: 'ex_pull_003', name: 'Bicep Curl', targetWeight: 10, targetReps: 8, unit: 'kg', sets: 3, muscleGroup: 'Pull', equipment: 'Dumbbell' },
        { exerciseId: 'ex_pull_004', name: 'T-Bar Row', targetWeight: 85, targetReps: 6, unit: 'kg', sets: 3, muscleGroup: 'Pull', equipment: 'Barbell' },
        { exerciseId: 'ex_pull_005', name: 'Hammer Curl', targetWeight: 40, targetReps: 5, unit: 'lbs', sets: 3, muscleGroup: 'Pull', equipment: 'Dumbbell' },
        { exerciseId: 'ex_pull_006', name: 'Seated Row', targetWeight: 45, targetReps: 8, unit: 'kg', sets: 3, muscleGroup: 'Pull', equipment: 'Machine' },
        { exerciseId: 'ex_cardio_001', name: 'Cardio', targetWeight: 0, targetReps: 30, unit: 'minutes', sets: 1, muscleGroup: 'Cardio', equipment: 'Machine' }
    ],
    
    legs: [
        { exerciseId: 'ex_legs_001', name: 'Lying Leg Curl', targetWeight: 55, targetReps: 5, unit: 'kg', sets: 3, muscleGroup: 'Legs', equipment: 'Machine' },
        { exerciseId: 'ex_legs_002', name: 'Leg Press', targetWeight: 90, targetReps: 6, unit: 'kg', sets: 3, muscleGroup: 'Legs', equipment: 'Machine' },
        { exerciseId: 'ex_legs_003', name: 'Leg Extension', targetWeight: 85, targetReps: 6, unit: 'kg', sets: 3, muscleGroup: 'Legs', equipment: 'Machine' },
        { exerciseId: 'ex_legs_004', name: 'Stiff-Leg Deadlift', targetWeight: 40, targetReps: 5, unit: 'kg', sets: 3, muscleGroup: 'Legs', equipment: 'Barbell' },
        { exerciseId: 'ex_legs_005', name: 'Hip Abduction', targetWeight: 150, targetReps: 8, unit: 'lbs', sets: 3, muscleGroup: 'Legs', equipment: 'Machine' },
        { exerciseId: 'ex_legs_006', name: 'Hip Adduction', targetWeight: 40, targetReps: 8, unit: 'kg', sets: 3, muscleGroup: 'Legs', equipment: 'Machine' },
        { exerciseId: 'ex_abs_001', name: 'Cable Crunch', targetWeight: 150, targetReps: 9, unit: 'lbs', sets: 3, muscleGroup: 'Abs', equipment: 'Machine' },
        { exerciseId: 'ex_cardio_001', name: 'Cardio', targetWeight: 0, targetReps: 20, unit: 'minutes', sets: 1, muscleGroup: 'Cardio', equipment: 'Machine' }
    ]
};

export const workoutSchedule = {
    0: 'push',  // Sunday
    1: 'pull',  // Monday
    2: null,    // Tuesday (Rest)
    3: 'legs',  // Wednesday
    4: 'push',  // Thursday
    5: 'pull',  // Friday
    6: 'legs'   // Saturday
};