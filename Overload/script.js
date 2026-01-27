/* ========================================
   IRON PROTOCOL - FITNESS TRACKER
   Main JavaScript Application
   ======================================== */

// ========================================
// DATA STRUCTURE
// ========================================

const EXERCISE_DATABASE = [
    // PUSH EXERCISES
    { name: 'Pec Deck', muscleGroup: 'push', equipment: 'machine' },
    { name: 'Incline Chest Press', muscleGroup: 'push', equipment: 'machine' },
    { name: 'Unilateral Triceps Extension', muscleGroup: 'push', equipment: 'machine' },
    { name: 'Shoulder Press', muscleGroup: 'push', equipment: 'machine' },
    { name: 'Reverse Curls', muscleGroup: 'push', equipment: 'barbell' },
    { name: 'Dips', muscleGroup: 'push', equipment: 'bodyweight' },
    { name: 'Bench Press', muscleGroup: 'push', equipment: 'barbell' },
    { name: 'Overhead Press', muscleGroup: 'push', equipment: 'barbell' },
    { name: 'Cable Fly', muscleGroup: 'push', equipment: 'machine' },
    
    // PULL EXERCISES
    { name: 'Pull-Ups', muscleGroup: 'pull', equipment: 'bodyweight' },
    { name: 'Lat Raise Machine', muscleGroup: 'pull', equipment: 'machine' },
    { name: 'Bicep Curl', muscleGroup: 'pull', equipment: 'dumbbell' },
    { name: 'T-Bar Row', muscleGroup: 'pull', equipment: 'barbell' },
    { name: 'Hammer Curl', muscleGroup: 'pull', equipment: 'dumbbell' },
    { name: 'Cable Curl', muscleGroup: 'pull', equipment: 'machine' },
    { name: 'Seated Row', muscleGroup: 'pull', equipment: 'machine' },
    { name: 'Lat Pulldown', muscleGroup: 'pull', equipment: 'machine' },
    { name: 'Deadlift', muscleGroup: 'pull', equipment: 'barbell' },
    
    // LEGS EXERCISES
    { name: 'Lying Leg Curl', muscleGroup: 'legs', equipment: 'machine' },
    { name: 'Leg Press', muscleGroup: 'legs', equipment: 'machine' },
    { name: 'Unilateral Calf Raises', muscleGroup: 'legs', equipment: 'machine' },
    { name: 'Leg Extension', muscleGroup: 'legs', equipment: 'machine' },
    { name: 'Stiff-Leg Deadlift', muscleGroup: 'legs', equipment: 'barbell' },
    { name: 'Hip Abduction', muscleGroup: 'legs', equipment: 'machine' },
    { name: 'Hip Adduction', muscleGroup: 'legs', equipment: 'machine' },
    { name: 'Squat', muscleGroup: 'legs', equipment: 'barbell' },
    { name: 'Bulgarian Split Squat', muscleGroup: 'legs', equipment: 'dumbbell' },
    
    // ABS
    { name: 'Abs', muscleGroup: 'abs', equipment: 'machine' },
    { name: 'Cable Crunch', muscleGroup: 'abs', equipment: 'machine' },
    { name: 'Hanging Leg Raise', muscleGroup: 'abs', equipment: 'bodyweight' },
    { name: 'Plank', muscleGroup: 'abs', equipment: 'bodyweight' },
    
    // CARDIO
    { name: 'Cardio', muscleGroup: 'cardio', equipment: 'machine' },
    { name: 'Treadmill', muscleGroup: 'cardio', equipment: 'machine' },
    { name: 'Bike', muscleGroup: 'cardio', equipment: 'machine' },
    { name: 'Rowing', muscleGroup: 'cardio', equipment: 'machine' },
];

// Preloaded workout programs
const WORKOUT_PROGRAMS = {
    push: [
        { exercise: 'Pec Deck', target: '150 lbs + 30 kg × 5.5', sets: 6 },
        { exercise: 'Incline Chest Press', target: '50 lbs / 20 kg × 6', sets: 6 },
        { exercise: 'Unilateral Triceps Extension', target: '100 lbs × 8', sets: 8 },
        { exercise: 'Shoulder Press', target: '50 lbs × 4.5', sets: 5 },
        { exercise: 'Reverse Curls', target: '140 lbs × 8', sets: 8 },
        { exercise: 'Dips', target: '5 reps', sets: 5 },
        { exercise: 'Abs', target: '150 lbs × 9', sets: 9 },
        { exercise: 'Cardio', target: '30 minutes', sets: 1 },
    ],
    pull: [
        { exercise: 'Pull-Ups', target: '6 reps + 15 lbs × 5.5', sets: 6 },
        { exercise: 'Lat Raise Machine', target: '13th Plate × 5.5', sets: 6 },
        { exercise: 'Bicep Curl', target: '10 kg × 8', sets: 8 },
        { exercise: 'T-Bar Row', target: '85 kg × 6', sets: 6 },
        { exercise: 'Hammer Curl', target: '40 lbs × 5', sets: 5 },
        { exercise: 'Cable Curl', target: '90 lbs × 5', sets: 5 },
        { exercise: 'Seated Row', target: '45 kg × 8', sets: 8 },
        { exercise: 'Cardio', target: '30 minutes', sets: 1 },
    ],
    legs: [
        { exercise: 'Lying Leg Curl', target: '55 kg × 5', sets: 5 },
        { exercise: 'Leg Press', target: '90 kg × 6', sets: 6 },
        { exercise: 'Unilateral Calf Raises', target: '65 kg × 6', sets: 6 },
        { exercise: 'Leg Extension', target: '85 kg × 6', sets: 6 },
        { exercise: 'Stiff-Leg Deadlift', target: '40 kg × 5', sets: 5 },
        { exercise: 'Hip Abduction', target: '150 lbs', sets: 3 },
        { exercise: 'Hip Adduction', target: '40 kg', sets: 3 },
        { exercise: 'Abs', target: '150 lbs', sets: 9 },
        { exercise: 'Cardio', target: '20 minutes', sets: 1 },
    ],
};

// ========================================
// STATE MANAGEMENT
// ========================================

let appState = {
    currentView: 'today',
    currentWorkout: null,
    workoutStartTime: null,
    timerInterval: null,
    timerSeconds: 0,
    timerRunning: false,
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateHeaderStats();
    renderExerciseLibrary();
    renderHistory();
    setupProgressCharts();
});

function initializeApp() {
    // Initialize localStorage if needed
    if (!localStorage.getItem('workoutHistory')) {
        localStorage.setItem('workoutHistory', JSON.stringify([]));
    }
    
    // Set current date
    updateCurrentDate();
    
    // Load today's workout based on schedule
    suggestTodaysWorkout();
}

function updateCurrentDate() {
    const dateDisplay = document.getElementById('currentDate');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = today.toLocaleDateString('en-US', options).toUpperCase();
}

function suggestTodaysWorkout() {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const schedule = {
        0: 'push',  // Sunday
        1: 'pull',  // Monday
        2: null,    // Tuesday - Rest
        3: 'legs',  // Wednesday
        4: 'push',  // Thursday
        5: 'pull',  // Friday
        6: 'legs',  // Saturday
    };
    
    const suggestedWorkout = schedule[today];
    if (suggestedWorkout) {
        const titleElement = document.getElementById('todayTitle');
        titleElement.textContent = `TODAY: ${suggestedWorkout.toUpperCase()}`;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchView(e.target.dataset.view));
    });
    
    // Workout selection
    document.querySelectorAll('.workout-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => startWorkout(e.target.dataset.workout));
    });
    
    // Timer controls
    document.getElementById('timerBtn').addEventListener('click', openTimerModal);
    document.getElementById('timerClose').addEventListener('click', closeTimerModal);
    document.getElementById('timerStart').addEventListener('click', startTimer);
    document.getElementById('timerPause').addEventListener('click', pauseTimer);
    document.getElementById('timerReset').addEventListener('click', resetTimer);
    
    // Timer presets
    document.querySelectorAll('.timer-preset').forEach(btn => {
        btn.addEventListener('click', (e) => setTimerPreset(e.target));
    });
    
    // Finish workout
    document.getElementById('finishWorkout').addEventListener('click', finishWorkout);
    
    // Completion modal
    document.getElementById('completionClose').addEventListener('click', closeCompletionModal);
    
    // Exercise filter
    document.getElementById('muscleFilter').addEventListener('change', (e) => {
        renderExerciseLibrary(e.target.value);
    });
    
    // Progress period toggle
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateVolumeChart(e.target.dataset.period);
        });
    });
    
    // Exercise progress selector
    document.getElementById('exerciseSelect').addEventListener('change', (e) => {
        updateExerciseChart(e.target.value);
    });
}

// ========================================
// VIEW MANAGEMENT
// ========================================

function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`view-${viewName}`).classList.add('active');
    
    appState.currentView = viewName;
    
    // Refresh data if needed
    if (viewName === 'history') {
        renderHistory();
    } else if (viewName === 'progress') {
        updateVolumeChart('week');
        populateExerciseSelect();
    }
}

// ========================================
// WORKOUT MANAGEMENT
// ========================================

function startWorkout(workoutType) {
    appState.currentWorkout = workoutType;
    appState.workoutStartTime = new Date();
    
    const titleElement = document.getElementById('todayTitle');
    titleElement.textContent = `${workoutType.toUpperCase()} WORKOUT`;
    
    renderWorkoutExercises(workoutType);
    
    document.getElementById('activeWorkout').classList.remove('hidden');
}

function renderWorkoutExercises(workoutType) {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';
    
    const program = WORKOUT_PROGRAMS[workoutType];
    
    program.forEach((item, index) => {
        const exerciseItem = createExerciseItem(item, index);
        exerciseList.appendChild(exerciseItem);
    });
}

function createExerciseItem(item, index) {
    const div = document.createElement('div');
    div.className = 'exercise-item';
    div.dataset.exerciseIndex = index;
    
    const header = document.createElement('div');
    header.className = 'exercise-header';
    
    const name = document.createElement('div');
    name.className = 'exercise-name';
    name.textContent = item.exercise;
    
    const target = document.createElement('div');
    target.className = 'exercise-target';
    target.textContent = `TARGET: ${item.target}`;
    
    header.appendChild(name);
    header.appendChild(target);
    
    const setList = document.createElement('div');
    setList.className = 'set-list';
    
    // Create sets
    for (let i = 0; i < item.sets; i++) {
        const setItem = createSetItem(i + 1);
        setList.appendChild(setItem);
    }
    
    // Add set button
    const addSetBtn = document.createElement('button');
    addSetBtn.className = 'add-set-btn';
    addSetBtn.textContent = '+ ADD SET';
    addSetBtn.addEventListener('click', () => {
        const newSetNum = setList.querySelectorAll('.set-item').length + 1;
        const newSet = createSetItem(newSetNum);
        setList.insertBefore(newSet, addSetBtn);
    });
    
    div.appendChild(header);
    div.appendChild(setList);
    setList.appendChild(addSetBtn);
    
    return div;
}

function createSetItem(setNumber) {
    const div = document.createElement('div');
    div.className = 'set-item';
    
    const label = document.createElement('div');
    label.className = 'set-label';
    label.textContent = `SET ${setNumber}`;
    
    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.className = 'set-input';
    weightInput.placeholder = 'Weight';
    weightInput.step = '0.5';
    
    const repsInput = document.createElement('input');
    repsInput.type = 'number';
    repsInput.className = 'set-input';
    repsInput.placeholder = 'Reps';
    
    const completeBtn = document.createElement('button');
    completeBtn.className = 'set-complete';
    completeBtn.textContent = '✓';
    completeBtn.addEventListener('click', () => {
        completeBtn.classList.toggle('completed');
    });
    
    div.appendChild(label);
    div.appendChild(weightInput);
    div.appendChild(repsInput);
    div.appendChild(completeBtn);
    
    return div;
}

function finishWorkout() {
    const exercises = collectWorkoutData();
    
    if (exercises.length === 0) {
        alert('Please log at least one set before finishing the workout.');
        return;
    }
    
    const workoutData = {
        date: new Date().toISOString(),
        type: appState.currentWorkout,
        exercises: exercises,
        duration: calculateDuration(),
    };
    
    saveWorkout(workoutData);
    showCompletionModal(workoutData);
    
    // Reset workout state
    appState.currentWorkout = null;
    appState.workoutStartTime = null;
    document.getElementById('activeWorkout').classList.add('hidden');
    document.getElementById('todayTitle').textContent = 'SELECT WORKOUT';
}

function collectWorkoutData() {
    const exerciseItems = document.querySelectorAll('.exercise-item');
    const exercises = [];
    
    exerciseItems.forEach(item => {
        const exerciseName = item.querySelector('.exercise-name').textContent;
        const sets = [];
        
        item.querySelectorAll('.set-item').forEach(setItem => {
            const weight = parseFloat(setItem.querySelector('input[placeholder="Weight"]').value);
            const reps = parseInt(setItem.querySelector('input[placeholder="Reps"]').value);
            const completed = setItem.querySelector('.set-complete').classList.contains('completed');
            
            if (weight && reps && completed) {
                sets.push({ weight, reps });
            }
        });
        
        if (sets.length > 0) {
            exercises.push({
                name: exerciseName,
                sets: sets,
            });
        }
    });
    
    return exercises;
}

function calculateDuration() {
    if (!appState.workoutStartTime) return 0;
    const endTime = new Date();
    const durationMs = endTime - appState.workoutStartTime;
    return Math.floor(durationMs / 60000); // Convert to minutes
}

function saveWorkout(workoutData) {
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    history.unshift(workoutData); // Add to beginning
    
    // Keep only last 100 workouts
    if (history.length > 100) {
        history.pop();
    }
    
    localStorage.setItem('workoutHistory', JSON.stringify(history));
    updateHeaderStats();
}

// ========================================
// COMPLETION MODAL
// ========================================

function showCompletionModal(workoutData) {
    const totalVolume = calculateTotalVolume(workoutData.exercises);
    
    document.getElementById('completionExercises').textContent = workoutData.exercises.length;
    document.getElementById('completionVolume').textContent = `${totalVolume.toFixed(0)} KG`;
    document.getElementById('completionDuration').textContent = `${workoutData.duration} MIN`;
    
    document.getElementById('completionModal').classList.remove('hidden');
}

function closeCompletionModal() {
    document.getElementById('completionModal').classList.add('hidden');
}

function calculateTotalVolume(exercises) {
    let totalVolume = 0;
    exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            totalVolume += set.weight * set.reps;
        });
    });
    return totalVolume;
}

// ========================================
// TIMER
// ========================================

function openTimerModal() {
    document.getElementById('timerModal').classList.remove('hidden');
}

function closeTimerModal() {
    document.getElementById('timerModal').classList.add('hidden');
    if (appState.timerRunning) {
        pauseTimer();
    }
}

function setTimerPreset(button) {
    const seconds = parseInt(button.id.replace('timer', ''));
    appState.timerSeconds = seconds;
    updateTimerDisplay();
}

function startTimer() {
    if (appState.timerSeconds === 0) {
        appState.timerSeconds = 60; // Default 60 seconds
    }
    
    appState.timerRunning = true;
    document.getElementById('timerStart').classList.add('hidden');
    document.getElementById('timerPause').classList.remove('hidden');
    
    appState.timerInterval = setInterval(() => {
        appState.timerSeconds--;
        updateTimerDisplay();
        
        if (appState.timerSeconds <= 0) {
            pauseTimer();
            playTimerAlert();
        }
    }, 1000);
}

function pauseTimer() {
    appState.timerRunning = false;
    clearInterval(appState.timerInterval);
    document.getElementById('timerStart').classList.remove('hidden');
    document.getElementById('timerPause').classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    appState.timerSeconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(appState.timerSeconds / 60);
    const seconds = appState.timerSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timerDisplay').textContent = display;
    document.querySelector('.timer-display').textContent = display;
}

function playTimerAlert() {
    // Visual alert (could add audio here)
    const modal = document.getElementById('timerModal');
    modal.style.animation = 'none';
    setTimeout(() => {
        modal.style.animation = 'pulse 0.5s ease-in-out 3';
    }, 10);
}

// ========================================
// HISTORY
// ========================================

function renderHistory() {
    const historyList = document.getElementById('historyList');
    const noHistory = document.getElementById('noHistory');
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        noHistory.classList.remove('hidden');
        return;
    }
    
    noHistory.classList.add('hidden');
    
    history.forEach((workout, index) => {
        const item = createHistoryItem(workout);
        item.style.animationDelay = `${index * 0.05}s`;
        historyList.appendChild(item);
    });
}

function createHistoryItem(workout) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const header = document.createElement('div');
    header.className = 'history-header';
    
    const date = document.createElement('div');
    date.className = 'history-date';
    date.textContent = new Date(workout.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    }).toUpperCase();
    
    const type = document.createElement('div');
    type.className = `history-type ${workout.type}`;
    type.textContent = workout.type.toUpperCase();
    
    header.appendChild(date);
    header.appendChild(type);
    
    const stats = document.createElement('div');
    stats.className = 'history-stats';
    
    const totalVolume = calculateTotalVolume(workout.exercises);
    
    stats.innerHTML = `
        <div class="history-stat">
            <div class="history-stat-label">EXERCISES</div>
            <div class="history-stat-value">${workout.exercises.length}</div>
        </div>
        <div class="history-stat">
            <div class="history-stat-label">VOLUME</div>
            <div class="history-stat-value">${totalVolume.toFixed(0)} KG</div>
        </div>
        <div class="history-stat">
            <div class="history-stat-label">DURATION</div>
            <div class="history-stat-value">${workout.duration} MIN</div>
        </div>
    `;
    
    div.appendChild(header);
    div.appendChild(stats);
    
    return div;
}

// ========================================
// HEADER STATS
// ========================================

function updateHeaderStats() {
    updateWeekNumber();
    updateWeeklyVolume();
    updateStreak();
}

function updateWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.ceil(diff / oneWeek);
    
    document.getElementById('currentWeek').textContent = weekNumber.toString().padStart(2, '0');
}

function updateWeeklyVolume() {
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let weeklyVolume = 0;
    history.forEach(workout => {
        const workoutDate = new Date(workout.date);
        if (workoutDate >= weekAgo) {
            weeklyVolume += calculateTotalVolume(workout.exercises);
        }
    });
    
    document.getElementById('weeklyVolume').textContent = Math.round(weeklyVolume);
}

function updateStreak() {
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    
    if (history.length === 0) {
        document.getElementById('streak').textContent = '0';
        return;
    }
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < history.length; i++) {
        const workoutDate = new Date(history[i].date);
        workoutDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak || (streak === 0 && daysDiff === 0)) {
            streak++;
        } else if (daysDiff > streak) {
            break;
        }
    }
    
    document.getElementById('streak').textContent = streak;
}

// ========================================
// EXERCISE LIBRARY
// ========================================

function renderExerciseLibrary(filter = 'all') {
    const library = document.getElementById('exerciseLibrary');
    library.innerHTML = '';
    
    const filtered = filter === 'all' 
        ? EXERCISE_DATABASE 
        : EXERCISE_DATABASE.filter(ex => ex.muscleGroup === filter);
    
    filtered.forEach(exercise => {
        const item = createLibraryItem(exercise);
        library.appendChild(item);
    });
}

function createLibraryItem(exercise) {
    const div = document.createElement('div');
    div.className = 'library-item';
    
    div.innerHTML = `
        <div class="library-name">${exercise.name}</div>
        <div class="library-meta">
            <span>${exercise.muscleGroup.toUpperCase()}</span>
            <span>${exercise.equipment.toUpperCase()}</span>
        </div>
    `;
    
    return div;
}

// ========================================
// PROGRESS CHARTS
// ========================================

function setupProgressCharts() {
    updateVolumeChart('week');
    populateExerciseSelect();
}

function populateExerciseSelect() {
    const select = document.getElementById('exerciseSelect');
    select.innerHTML = '<option value="">SELECT EXERCISE</option>';
    
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    const exerciseNames = new Set();
    
    history.forEach(workout => {
        workout.exercises.forEach(exercise => {
            exerciseNames.add(exercise.name);
        });
    });
    
    Array.from(exerciseNames).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function updateVolumeChart(period) {
    const canvas = document.getElementById('volumeChart');
    const ctx = canvas.getContext('2d');
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get data points
    const dataPoints = getVolumeDataPoints(history, period);
    
    if (dataPoints.length === 0) {
        drawNoData(ctx, canvas);
        return;
    }
    
    drawLineChart(ctx, canvas, dataPoints, 'VOLUME (KG)');
}

function getVolumeDataPoints(history, period) {
    const now = new Date();
    const points = [];
    
    const daysToShow = period === 'week' ? 7 : 30;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        let dayVolume = 0;
        history.forEach(workout => {
            const workoutDate = new Date(workout.date);
            if (workoutDate >= date && workoutDate < nextDate) {
                dayVolume += calculateTotalVolume(workout.exercises);
            }
        });
        
        points.push({
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: dayVolume,
        });
    }
    
    return points;
}

function updateExerciseChart(exerciseName) {
    const canvas = document.getElementById('exerciseChart');
    const noData = document.getElementById('noProgressData');
    
    if (!exerciseName) {
        canvas.classList.add('hidden');
        noData.classList.remove('hidden');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get data points
    const dataPoints = getExerciseDataPoints(history, exerciseName);
    
    if (dataPoints.length === 0) {
        canvas.classList.add('hidden');
        noData.classList.remove('hidden');
        return;
    }
    
    canvas.classList.remove('hidden');
    noData.classList.add('hidden');
    
    drawLineChart(ctx, canvas, dataPoints, exerciseName.toUpperCase());
}

function getExerciseDataPoints(history, exerciseName) {
    const points = [];
    
    // Get last 10 workouts with this exercise
    const relevantWorkouts = history.filter(workout => 
        workout.exercises.some(ex => ex.name === exerciseName)
    ).slice(0, 10).reverse();
    
    relevantWorkouts.forEach(workout => {
        const exercise = workout.exercises.find(ex => ex.name === exerciseName);
        if (exercise && exercise.sets.length > 0) {
            // Get max weight used
            const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
            
            points.push({
                label: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: maxWeight,
            });
        }
    });
    
    return points;
}

function drawLineChart(ctx, canvas, dataPoints, title) {
    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Set colors
    ctx.strokeStyle = '#00ff41';
    ctx.fillStyle = '#00ff41';
    ctx.font = '12px JetBrains Mono';
    
    // Find min and max values
    const values = dataPoints.map(p => p.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;
    
    // Draw axes
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw data points and lines
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const pointSpacing = chartWidth / (dataPoints.length - 1 || 1);
    
    dataPoints.forEach((point, index) => {
        const x = padding + index * pointSpacing;
        const normalizedValue = (point.value - minValue) / range;
        const y = height - padding - (normalizedValue * chartHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = '#00ff41';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw value
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(point.value.toFixed(0), x, y - 10);
        
        // Draw label
        ctx.fillStyle = '#888888';
        ctx.save();
        ctx.translate(x, height - padding + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(point.label, 0, 0);
        ctx.restore();
    });
    
    ctx.strokeStyle = '#00ff41';
    ctx.stroke();
}

function drawNoData(ctx, canvas) {
    ctx.fillStyle = '#555555';
    ctx.font = '14px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('NO DATA AVAILABLE', canvas.width / 2, canvas.height / 2);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Add pulse animation for timer alert
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);