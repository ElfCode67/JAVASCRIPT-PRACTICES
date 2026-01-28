/**
 * =============================================
 * OVERLOAD - Fitness Tracker
 * Vanilla JavaScript - No frameworks
 * =============================================
 */

const app = {
    // =============================================
    // STATE VARIABLES
    // =============================================
    currentPage: 'landing-page',
    currentWorkout: null,
    workoutStartTime: null,
    workoutTimer: null,
    restTimer: null,
    restTimeRemaining: 90, // 90 seconds default
    restTimerInterval: null,
    
    // =============================================
    // EXERCISE DATABASE
    // =============================================
    exercises: [
        // PUSH EXERCISES
        { id: 1, name: 'Pec Deck', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 2, name: 'Incline Chest Press', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 3, name: 'Unilateral Triceps Extension', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 4, name: 'Shoulder Press', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 5, name: 'Reverse Curls', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 6, name: 'Dips', muscleGroup: 'Push', equipment: 'Bodyweight' },
        { id: 7, name: 'Abs', muscleGroup: 'Abs', equipment: 'Machine' },
        { id: 8, name: 'Cardio', muscleGroup: 'Cardio', equipment: 'Machine' },
        
        // PULL EXERCISES
        { id: 9, name: 'Pull-Ups', muscleGroup: 'Pull', equipment: 'Bodyweight' },
        { id: 10, name: 'Lat Raise Machine', muscleGroup: 'Pull', equipment: 'Machine' },
        { id: 11, name: 'Bicep Curl', muscleGroup: 'Pull', equipment: 'Dumbbell' },
        { id: 12, name: 'T-Bar Row', muscleGroup: 'Pull', equipment: 'Barbell' },
        { id: 13, name: 'Hammer Curl', muscleGroup: 'Pull', equipment: 'Dumbbell' },
        { id: 14, name: 'Cable Curl', muscleGroup: 'Pull', equipment: 'Machine' },
        { id: 15, name: 'Seated Row', muscleGroup: 'Pull', equipment: 'Machine' },
        
        // LEG EXERCISES
        { id: 16, name: 'Lying Leg Curl', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 17, name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 18, name: 'Unilateral Calf Raises', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 19, name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 20, name: 'Stiff-Leg Deadlift', muscleGroup: 'Legs', equipment: 'Barbell' },
        { id: 21, name: 'Hip Abduction', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 22, name: 'Hip Adduction', muscleGroup: 'Legs', equipment: 'Machine' },
    ],
    
    // =============================================
    // WORKOUT PROGRAMS (PPL)
    // =============================================
    workoutPrograms: {
        push: [
            { exerciseId: 1, targetWeight: 150, targetReps: 5.5, unit: 'lbs', sets: 3 },
            { exerciseId: 2, targetWeight: 50, targetReps: 6, unit: 'lbs', sets: 3 },
            { exerciseId: 3, targetWeight: 100, targetReps: 8, unit: 'lbs', sets: 3 },
            { exerciseId: 4, targetWeight: 50, targetReps: 4.5, unit: 'lbs', sets: 3 },
            { exerciseId: 5, targetWeight: 140, targetReps: 8, unit: 'lbs', sets: 3 },
            { exerciseId: 6, targetWeight: 0, targetReps: 5, unit: 'bodyweight', sets: 3 },
            { exerciseId: 7, targetWeight: 150, targetReps: 9, unit: 'lbs', sets: 3 },
            { exerciseId: 8, targetWeight: 0, targetReps: 30, unit: 'minutes', sets: 1 }
        ],
        pull: [
            { exerciseId: 9, targetWeight: 15, targetReps: 5.5, unit: 'lbs', sets: 3 },
            { exerciseId: 10, targetWeight: 13, targetReps: 5.5, unit: 'plate', sets: 3 },
            { exerciseId: 11, targetWeight: 10, targetReps: 8, unit: 'kg', sets: 3 },
            { exerciseId: 12, targetWeight: 85, targetReps: 6, unit: 'kg', sets: 3 },
            { exerciseId: 13, targetWeight: 40, targetReps: 5, unit: 'lbs', sets: 3 },
            { exerciseId: 14, targetWeight: 90, targetReps: 5, unit: 'lbs', sets: 3 },
            { exerciseId: 15, targetWeight: 45, targetReps: 8, unit: 'kg', sets: 3 },
            { exerciseId: 8, targetWeight: 0, targetReps: 30, unit: 'minutes', sets: 1 }
        ],
        legs: [
            { exerciseId: 16, targetWeight: 55, targetReps: 5, unit: 'kg', sets: 3 },
            { exerciseId: 17, targetWeight: 90, targetReps: 6, unit: 'kg', sets: 3 },
            { exerciseId: 18, targetWeight: 65, targetReps: 6, unit: 'kg', sets: 3 },
            { exerciseId: 19, targetWeight: 85, targetReps: 6, unit: 'kg', sets: 3 },
            { exerciseId: 20, targetWeight: 40, targetReps: 5, unit: 'kg', sets: 3 },
            { exerciseId: 21, targetWeight: 150, targetReps: 8, unit: 'lbs', sets: 3 },
            { exerciseId: 22, targetWeight: 40, targetReps: 8, unit: 'kg', sets: 3 },
            { exerciseId: 7, targetWeight: 150, targetReps: 9, unit: 'lbs', sets: 3 },
            { exerciseId: 8, targetWeight: 0, targetReps: 20, unit: 'minutes', sets: 1 }
        ]
    },
    
    // =============================================
    // WORKOUT SCHEDULE (PPL)
    // =============================================
    workoutSchedule: {
        0: 'push',  // Sunday
        1: 'pull',  // Monday
        2: null,    // Tuesday (Rest)
        3: 'legs',  // Wednesday
        4: 'push',  // Thursday
        5: 'pull',  // Friday
        6: 'legs'   // Saturday
    },
    
    // =============================================
    // INITIALIZATION
    // =============================================
    init() {
        console.log('🏋️ OVERLOAD initialized');
        this.initializeStorage();
        this.updateAllNavLinks();
        this.populateExerciseSelects();
        this.updateDashboard();
        this.renderExerciseLibrary();
    },
    
    /**
     * Initialize localStorage if not exists
     */
    initializeStorage() {
        if (!localStorage.getItem('overload_data')) {
            const initialData = {
                workouts: [],
                personalRecords: {},
                streak: 0,
                lastWorkoutDate: null
            };
            localStorage.setItem('overload_data', JSON.stringify(initialData));
        }
    },
    
    /**
     * Get data from localStorage
     */
    getData() {
        return JSON.parse(localStorage.getItem('overload_data'));
    },
    
    /**
     * Save data to localStorage
     */
    saveData(data) {
        localStorage.setItem('overload_data', JSON.stringify(data));
    },
    
    // =============================================
    // NAVIGATION
    // =============================================
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
            this.currentPage = pageId;
            
            // Update nav links
            this.updateAllNavLinks();
            
            // Page-specific updates
            if (pageId === 'dashboard') {
                this.updateDashboard();
            } else if (pageId === 'progress') {
                this.updateChart();
            } else if (pageId === 'exercises') {
                this.renderExerciseLibrary();
            }
        }
    },
    
    goToDashboard() {
        this.showPage('dashboard');
    },
    
    updateAllNavLinks() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Find and activate current page links
        document.querySelectorAll(`.nav-link[onclick*="${this.currentPage}"]`).forEach(link => {
            link.classList.add('active');
        });
    },
    
    // =============================================
    // DASHBOARD
    // =============================================
    updateDashboard() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const todayWorkout = this.workoutSchedule[dayOfWeek];
        
        // Update date
        document.getElementById('today-date').textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Update today's workout title
        if (todayWorkout) {
            document.getElementById('today-title').textContent = `Today: ${todayWorkout.toUpperCase()} Day`;
            document.getElementById('cta-workout-type').textContent = `${todayWorkout.charAt(0).toUpperCase() + todayWorkout.slice(1)} Day`;
            document.getElementById('start-workout-cta').disabled = false;
        } else {
            document.getElementById('today-title').textContent = 'Today: Rest Day';
            document.getElementById('cta-workout-type').textContent = 'Recovery & Growth';
            document.getElementById('start-workout-cta').disabled = true;
        }
        
        // Calculate week number (assuming year started 2026-01-01)
        const startOfYear = new Date(2026, 0, 1);
        const weekNumber = Math.ceil((today - startOfYear) / (7 * 24 * 60 * 60 * 1000));
        document.getElementById('week-badge').textContent = `Week ${weekNumber}`;
        
        // Update stats
        const data = this.getData();
        this.updateDashboardStats(data);
        this.renderRecentWorkouts(data.workouts);
    },
    
    /**
     * Update dashboard statistics
     */
    updateDashboardStats(data) {
        // Weekly volume
        const weeklyVolume = this.calculateWeeklyVolume(data.workouts);
        document.getElementById('weekly-volume-stat').textContent = Math.round(weeklyVolume).toLocaleString();
        
        // PRs this week
        const prs = this.calculatePRsThisWeek(data);
        document.getElementById('prs-stat').textContent = prs;
        
        // Streak
        document.getElementById('streak-stat').textContent = data.streak || 0;
    },
    
    /**
     * Calculate total volume for last 7 days
     */
    calculateWeeklyVolume(workouts) {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        let totalVolume = 0;
        
        workouts.forEach(workout => {
            if (new Date(workout.date).getTime() >= sevenDaysAgo) {
                totalVolume += workout.totalVolume || 0;
            }
        });
        
        return totalVolume;
    },
    
    /**
     * Calculate PRs in the last 7 days
     */
    calculatePRsThisWeek(data) {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        let prCount = 0;
        
        data.workouts.forEach(workout => {
            if (new Date(workout.date).getTime() >= sevenDaysAgo) {
                workout.exercises.forEach(exercise => {
                    const exerciseId = exercise.exerciseId;
                    const prKey = `ex_${exerciseId}`;
                    
                    exercise.sets.forEach(set => {
                        if (set.completed) {
                            const volume = this.convertToKg(set.weight, set.unit);
                            const currentPR = data.personalRecords[prKey] || 0;
                            
                            if (volume > currentPR) {
                                prCount++;
                            }
                        }
                    });
                });
            }
        });
        
        return prCount;
    },
    
    /**
     * Render recent workouts list
     */
    renderRecentWorkouts(workouts) {
        const container = document.getElementById('recent-workouts-container');
        
        if (!workouts || workouts.length === 0) {
            container.innerHTML = '<p class="empty-message">No workouts logged yet</p>';
            return;
        }
        
        // Get last 5 workouts
        const recent = workouts.slice(-5).reverse();
        
        container.innerHTML = recent.map(workout => {
            const date = new Date(workout.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return `
                <div class="workout-item">
                    <div class="workout-info">
                        <h4>${workout.type.toUpperCase()} WORKOUT</h4>
                        <div class="workout-meta">${dateStr} • ${workout.exercises.length} exercises • ${this.formatDuration(workout.duration)}</div>
                    </div>
                    <div class="workout-volume">
                        <div class="stat-value" style="font-size: 1.5rem;">${Math.round(workout.totalVolume)}</div>
                        <div class="stat-label">kg</div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Format seconds to MM:SS
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // =============================================
    // WORKOUT FLOW
    // =============================================
    
    /**
     * Start today's scheduled workout
     */
    startTodayWorkout() {
        const dayOfWeek = new Date().getDay();
        const todayWorkout = this.workoutSchedule[dayOfWeek];
        
        if (todayWorkout) {
            this.showPage('workout');
            setTimeout(() => this.startWorkout(todayWorkout), 100);
        }
    },
    
    /**
     * Start a specific workout type
     */
    startWorkout(type) {
        // Initialize workout
        this.currentWorkout = {
            type: type,
            startTime: Date.now(),
            exercises: []
        };
        
        // Load program exercises
        const program = this.workoutPrograms[type];
        program.forEach(exercise => {
            const sets = [];
            for (let i = 0; i < exercise.sets; i++) {
                sets.push({
                    weight: exercise.targetWeight,
                    reps: exercise.targetReps,
                    unit: exercise.unit,
                    completed: false
                });
            }
            
            this.currentWorkout.exercises.push({
                exerciseId: exercise.exerciseId,
                sets: sets
            });
        });
        
        // Start workout timer
        this.workoutStartTime = Date.now();
        this.startWorkoutTimer();
        
        // Update UI
        document.getElementById('workout-selection').style.display = 'none';
        document.getElementById('active-workout-container').style.display = 'block';
        document.getElementById('workout-title').textContent = `${type.toUpperCase()} WORKOUT`;
        
        // Render exercises
        this.renderWorkoutExercises();
    },
    
    /**
     * Start workout duration timer
     */
    startWorkoutTimer() {
        this.workoutTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.workoutStartTime) / 1000);
            document.getElementById('workout-duration').textContent = this.formatDuration(elapsed);
        }, 1000);
    },
    
    /**
     * Stop workout timer
     */
    stopWorkoutTimer() {
        if (this.workoutTimer) {
            clearInterval(this.workoutTimer);
            this.workoutTimer = null;
        }
    },
    
    /**
     * Render workout exercises
     */
    renderWorkoutExercises() {
        const container = document.getElementById('exercise-list-container');
        container.innerHTML = '';
        
        this.currentWorkout.exercises.forEach((exercise, exIndex) => {
            const exerciseData = this.exercises.find(e => e.id === exercise.exerciseId);
            const lastSession = this.getLastSession(exercise.exerciseId);
            
            const block = document.createElement('div');
            block.className = 'exercise-block';
            block.innerHTML = `
                <div class="exercise-header" onclick="app.toggleExercise(${exIndex})">
                    <div class="exercise-name">${exerciseData.name}</div>
                    <div class="exercise-meta">${exerciseData.muscleGroup} • ${exerciseData.equipment}</div>
                </div>
                <div class="exercise-body" id="exercise-body-${exIndex}">
                    ${lastSession ? `
                        <div class="last-session">
                            <strong>Last session:</strong> ${lastSession}
                        </div>
                    ` : ''}
                    <div class="sets-container" id="sets-container-${exIndex}">
                        ${this.renderSets(exercise.sets, exIndex)}
                    </div>
                    <button class="btn-add-set" onclick="app.addSet(${exIndex})">+ Add Set</button>
                </div>
            `;
            
            container.appendChild(block);
        });
    },
    
    /**
     * Toggle exercise expanded/collapsed
     */
    toggleExercise(exIndex) {
        const body = document.getElementById(`exercise-body-${exIndex}`);
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
    },
    
    /**
     * Get last session data for an exercise
     */
    getLastSession(exerciseId) {
        const data = this.getData();
        
        // Find last workout with this exercise
        for (let i = data.workouts.length - 1; i >= 0; i--) {
            const workout = data.workouts[i];
            const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
            
            if (exercise && exercise.sets.length > 0) {
                const bestSet = exercise.sets.reduce((best, set) => {
                    if (!set.completed) return best;
                    const volume = this.convertToKg(set.weight, set.unit);
                    const bestVolume = this.convertToKg(best.weight, best.unit);
                    return volume > bestVolume ? set : best;
                }, exercise.sets[0]);
                
                return `${bestSet.weight} ${bestSet.unit} × ${bestSet.reps} reps`;
            }
        }
        
        return null;
    },
    
    /**
     * Render sets for an exercise
     */
    renderSets(sets, exIndex) {
        return sets.map((set, setIndex) => `
            <div class="set-row">
                <div class="set-number">Set ${setIndex + 1}</div>
                <input 
                    type="number" 
                    class="set-input" 
                    placeholder="Weight"
                    value="${set.weight || ''}"
                    step="0.5"
                    oninput="app.updateSet(${exIndex}, ${setIndex}, 'weight', this.value)"
                >
                <input 
                    type="number" 
                    class="set-input" 
                    placeholder="Reps"
                    value="${set.reps || ''}"
                    step="0.5"
                    oninput="app.updateSet(${exIndex}, ${setIndex}, 'reps', this.value)"
                >
                <input 
                    type="checkbox" 
                    class="set-checkbox"
                    ${set.completed ? 'checked' : ''}
                    onchange="app.toggleSetComplete(${exIndex}, ${setIndex}, this.checked)"
                >
            </div>
        `).join('');
    },
    
    /**
     * Update set data
     */
    updateSet(exIndex, setIndex, field, value) {
        this.currentWorkout.exercises[exIndex].sets[setIndex][field] = parseFloat(value) || 0;
    },
    
    /**
     * Toggle set completion and start rest timer
     */
    toggleSetComplete(exIndex, setIndex, completed) {
        this.currentWorkout.exercises[exIndex].sets[setIndex].completed = completed;
        
        // Start rest timer when set is completed
        if (completed) {
            this.startRestTimer();
        }
    },
    
    /**
     * Add a new set to an exercise
     */
    addSet(exIndex) {
        const exercise = this.currentWorkout.exercises[exIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];
        
        exercise.sets.push({
            weight: lastSet.weight,
            reps: lastSet.reps,
            unit: lastSet.unit,
            completed: false
        });
        
        // Re-render sets
        const container = document.getElementById(`sets-container-${exIndex}`);
        container.innerHTML = this.renderSets(exercise.sets, exIndex);
    },
    
    // =============================================
    // REST TIMER
    // =============================================
    
    /**
     * Start rest timer
     */
    startRestTimer() {
        // Stop existing timer if any
        this.stopRestTimer();
        
        // Reset to 90 seconds
        this.restTimeRemaining = 90;
        
        // Show timer
        document.getElementById('rest-timer').style.display = 'block';
        
        // Start countdown
        this.restTimerInterval = setInterval(() => {
            this.restTimeRemaining--;
            
            const mins = Math.floor(this.restTimeRemaining / 60);
            const secs = this.restTimeRemaining % 60;
            document.getElementById('rest-time').textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            // Timer finished
            if (this.restTimeRemaining <= 0) {
                this.stopRestTimer();
                this.playTimerSound();
            }
        }, 1000);
    },
    
    /**
     * Pause rest timer
     */
    pauseRestTimer() {
        if (this.restTimerInterval) {
            clearInterval(this.restTimerInterval);
            this.restTimerInterval = null;
        } else {
            // Resume
            this.restTimerInterval = setInterval(() => {
                this.restTimeRemaining--;
                
                const mins = Math.floor(this.restTimeRemaining / 60);
                const secs = this.restTimeRemaining % 60;
                document.getElementById('rest-time').textContent = 
                    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                
                if (this.restTimeRemaining <= 0) {
                    this.stopRestTimer();
                    this.playTimerSound();
                }
            }, 1000);
        }
    },
    
    /**
     * Skip rest timer
     */
    skipRestTimer() {
        this.stopRestTimer();
    },
    
    /**
     * Stop rest timer
     */
    stopRestTimer() {
        if (this.restTimerInterval) {
            clearInterval(this.restTimerInterval);
            this.restTimerInterval = null;
        }
        document.getElementById('rest-timer').style.display = 'none';
    },
    
    /**
     * Play timer sound (simple beep)
     */
    playTimerSound() {
        // Visual alert
        const timerEl = document.getElementById('rest-timer');
        timerEl.style.animation = 'none';
        setTimeout(() => {
            timerEl.style.animation = 'pulse 0.5s ease 3';
        }, 10);
    },
    
    // =============================================
    // FINISH/CANCEL WORKOUT
    // =============================================
    
    /**
     * Finish workout and save data
     */
    finishWorkout() {
        if (!this.currentWorkout) return;
        
        this.stopWorkoutTimer();
        this.stopRestTimer();
        
        // Calculate total volume and duration
        let totalVolume = 0;
        this.currentWorkout.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                if (set.completed) {
                    const weightInKg = this.convertToKg(set.weight, set.unit);
                    totalVolume += weightInKg * set.reps;
                }
            });
        });
        
        const duration = Math.floor((Date.now() - this.workoutStartTime) / 1000);
        
        // Create workout object
        const workout = {
            date: new Date().toISOString(),
            type: this.currentWorkout.type,
            exercises: this.currentWorkout.exercises,
            totalVolume: totalVolume,
            duration: duration
        };
        
        // Save to localStorage
        const data = this.getData();
        data.workouts.push(workout);
        
        // Update personal records
        this.updatePersonalRecords(data, workout);
        
        // Update streak
        this.updateStreak(data);
        
        this.saveData(data);
        
        // Show summary
        document.getElementById('active-workout-container').style.display = 'none';
        document.getElementById('workout-summary-container').style.display = 'block';
        
        document.getElementById('summary-volume').textContent = `${Math.round(totalVolume)} kg`;
        document.getElementById('summary-duration').textContent = this.formatDuration(duration);
        document.getElementById('summary-exercises').textContent = this.currentWorkout.exercises.length;
        
        // Clear current workout
        this.currentWorkout = null;
    },
    
    /**
     * Cancel workout
     */
    cancelWorkout() {
        if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
            this.stopWorkoutTimer();
            this.stopRestTimer();
            this.currentWorkout = null;
            
            document.getElementById('active-workout-container').style.display = 'none';
            document.getElementById('workout-selection').style.display = 'block';
        }
    },
    
    /**
     * Convert weight to kg for consistency
     */
    convertToKg(weight, unit) {
        if (unit === 'lbs') {
            return weight * 0.453592;
        } else if (unit === 'kg') {
            return weight;
        } else if (unit === 'plate') {
            return weight * 2.5; // Assume each plate is 2.5kg
        }
        return weight;
    },
    
    /**
     * Update personal records
     */
    updatePersonalRecords(data, workout) {
        workout.exercises.forEach(exercise => {
            const prKey = `ex_${exercise.exerciseId}`;
            
            exercise.sets.forEach(set => {
                if (set.completed) {
                    const weightInKg = this.convertToKg(set.weight, set.unit);
                    const currentPR = data.personalRecords[prKey] || 0;
                    
                    if (weightInKg > currentPR) {
                        data.personalRecords[prKey] = weightInKg;
                    }
                }
            });
        });
    },
    
    /**
     * Update workout streak
     */
    updateStreak(data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (data.lastWorkoutDate) {
            const lastDate = new Date(data.lastWorkoutDate);
            lastDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((today - lastDate) / (24 * 60 * 60 * 1000));
            
            if (daysDiff === 0) {
                // Same day workout
            } else if (daysDiff === 1) {
                data.streak = (data.streak || 0) + 1;
            } else {
                data.streak = 1;
            }
        } else {
            data.streak = 1;
        }
        
        data.lastWorkoutDate = today.toISOString();
    },
    
    // =============================================
    // PROGRESS TRACKING
    // =============================================
    
    /**
     * Populate exercise selects
     */
    populateExerciseSelects() {
        const select = document.getElementById('exercise-chart-select');
        
        this.exercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex.id;
            option.textContent = ex.name;
            select.appendChild(option);
        });
    },
    
    /**
     * Update progress chart
     */
    updateChart() {
        const exerciseId = parseInt(document.getElementById('exercise-chart-select').value);
        const timeRange = parseInt(document.getElementById('time-range-select').value);
        
        if (!exerciseId) {
            this.drawEmptyChart();
            this.updateMuscleVolumeChart();
            return;
        }
        
        const data = this.getData();
        const cutoffDate = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
        
        // Get exercise history
        const history = [];
        data.workouts.forEach(workout => {
            if (new Date(workout.date).getTime() < cutoffDate) return;
            
            const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
            if (exercise) {
                exercise.sets.forEach(set => {
                    if (set.completed) {
                        history.push({
                            date: new Date(workout.date),
                            weight: this.convertToKg(set.weight, set.unit),
                            reps: set.reps
                        });
                    }
                });
            }
        });
        
        this.drawChart(history);
        this.updateMuscleVolumeChart();
    },
    
    /**
     * Draw empty chart
     */
    drawEmptyChart() {
        const canvas = document.getElementById('progress-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#666666';
        ctx.font = '16px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('Select an exercise to view progress', canvas.width / 2, canvas.height / 2);
    },
    
    /**
     * Draw progress chart using canvas
     */
    drawChart(history) {
        const canvas = document.getElementById('progress-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (history.length === 0) {
            ctx.fillStyle = '#666666';
            ctx.font = '16px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.fillText('No data available for this exercise', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 60;
        const chartWidth = canvas.width - (padding * 2);
        const chartHeight = canvas.height - (padding * 2);
        
        // Find min/max
        const weights = history.map(h => h.weight);
        const maxWeight = Math.max(...weights);
        const minWeight = Math.min(...weights);
        const range = maxWeight - minWeight || 1;
        
        // Draw axes
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw grid
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // Y labels
            const value = maxWeight - (range / 5) * i;
            ctx.fillStyle = '#a0a0a0';
            ctx.font = '12px "JetBrains Mono"';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value) + ' kg', padding - 10, y + 4);
        }
        
        // Draw line
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        history.forEach((point, i) => {
            const x = padding + (chartWidth / (history.length - 1 || 1)) * i;
            const y = canvas.height - padding - ((point.weight - minWeight) / range) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        history.forEach((point, i) => {
            const x = padding + (chartWidth / (history.length - 1 || 1)) * i;
            const y = canvas.height - padding - ((point.weight - minWeight) / range) * chartHeight;
            
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    
    /**
     * Update muscle volume chart
     */
    updateMuscleVolumeChart() {
        const data = this.getData();
        const muscleGroups = ['Push', 'Pull', 'Legs', 'Abs', 'Cardio'];
        const volumeByMuscle = {};
        
        muscleGroups.forEach(group => {
            volumeByMuscle[group] = 0;
        });
        
        // Last 30 days
        const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        data.workouts.forEach(workout => {
            if (new Date(workout.date).getTime() < cutoff) return;
            
            workout.exercises.forEach(exercise => {
                const exData = this.exercises.find(e => e.id === exercise.exerciseId);
                if (!exData) return;
                
                exercise.sets.forEach(set => {
                    if (set.completed) {
                        const weightKg = this.convertToKg(set.weight, set.unit);
                        volumeByMuscle[exData.muscleGroup] += weightKg * set.reps;
                    }
                });
            });
        });
        
        const maxVolume = Math.max(...Object.values(volumeByMuscle), 1);
        const container = document.getElementById('muscle-volume-bars');
        
        container.innerHTML = muscleGroups.map(group => {
            const volume = volumeByMuscle[group];
            const percentage = (volume / maxVolume) * 100;
            
            return `
                <div class="volume-bar-item">
                    <div class="volume-label">${group}</div>
                    <div class="volume-bar">
                        <div class="volume-fill" style="width: ${percentage}%">
                            <span class="volume-value">${Math.round(volume)} kg</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // =============================================
    // EXERCISE LIBRARY
    // =============================================
    
    /**
     * Render exercise library
     */
    renderExerciseLibrary() {
        this.filterExerciseLibrary();
    },
    
    /**
     * Filter exercise library
     */
    filterExerciseLibrary() {
        const searchTerm = document.getElementById('exercise-search-input').value.toLowerCase();
        const muscleFilter = document.getElementById('muscle-group-filter').value;
        
        const filtered = this.exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchTerm);
            const matchesMuscle = !muscleFilter || ex.muscleGroup === muscleFilter;
            return matchesSearch && matchesMuscle;
        });
        
        const container = document.getElementById('exercise-library-grid');
        
        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-message">No exercises found</p>';
            return;
        }
        
        container.innerHTML = filtered.map(ex => `
            <div class="exercise-card">
                <div class="exercise-card-name">${ex.name}</div>
                <div class="exercise-card-tags">
                    <span class="exercise-tag">${ex.muscleGroup}</span>
                    <span class="exercise-tag">${ex.equipment}</span>
                </div>
            </div>
        `).join('');
    }
};

// =============================================
// INITIALIZE APP ON PAGE LOAD
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});