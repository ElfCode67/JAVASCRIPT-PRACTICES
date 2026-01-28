// ========================================
// OVERLOAD — Fitness Tracker JavaScript
// Core functionality for workout tracking
// ========================================

const app = {
    // ========================================
    // STATE MANAGEMENT
    // ========================================
    currentPage: 'landing-page',
    activeWorkout: null,
    workoutStartTime: null,
    timerInterval: null,
    
    // ========================================
    // EXERCISE DATABASE
    // ========================================
    exercises: [
        // PUSH
        { id: 1, name: 'Pec Deck', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 2, name: 'Incline Chest Press', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 3, name: 'Unilateral Triceps Extension', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 4, name: 'Shoulder Press', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 5, name: 'Reverse Curls', muscleGroup: 'Push', equipment: 'Machine' },
        { id: 6, name: 'Dips', muscleGroup: 'Push', equipment: 'Bodyweight' },
        { id: 7, name: 'Abs', muscleGroup: 'Abs', equipment: 'Machine' },
        { id: 8, name: 'Cardio', muscleGroup: 'Cardio', equipment: 'Machine' },
        
        // PULL
        { id: 9, name: 'Pull-Ups', muscleGroup: 'Pull', equipment: 'Bodyweight' },
        { id: 10, name: 'Lat Raise Machine', muscleGroup: 'Pull', equipment: 'Machine' },
        { id: 11, name: 'Bicep Curl', muscleGroup: 'Pull', equipment: 'Dumbbell' },
        { id: 12, name: 'T-Bar Row', muscleGroup: 'Pull', equipment: 'Barbell' },
        { id: 13, name: 'Hammer Curl', muscleGroup: 'Pull', equipment: 'Dumbbell' },
        { id: 14, name: 'Cable Curl', muscleGroup: 'Pull', equipment: 'Machine' },
        { id: 15, name: 'Seated Row', muscleGroup: 'Pull', equipment: 'Machine' },
        
        // LEGS
        { id: 16, name: 'Lying Leg Curl', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 17, name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 18, name: 'Unilateral Calf Raises', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 19, name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 20, name: 'Stiff-Leg Deadlift', muscleGroup: 'Legs', equipment: 'Barbell' },
        { id: 21, name: 'Hip Abduction', muscleGroup: 'Legs', equipment: 'Machine' },
        { id: 22, name: 'Hip Adduction', muscleGroup: 'Legs', equipment: 'Machine' },
    ],
    
    // ========================================
    // PPL PROGRAM TEMPLATES
    // ========================================
    programs: {
        push: [
            { exerciseId: 1, sets: [{ weight: 150, reps: 5.5, unit: 'lbs' }] },
            { exerciseId: 2, sets: [{ weight: 50, reps: 6, unit: 'lbs' }] },
            { exerciseId: 3, sets: [{ weight: 100, reps: 8, unit: 'lbs' }] },
            { exerciseId: 4, sets: [{ weight: 50, reps: 4.5, unit: 'lbs' }] },
            { exerciseId: 5, sets: [{ weight: 140, reps: 8, unit: 'lbs' }] },
            { exerciseId: 6, sets: [{ weight: 0, reps: 5, unit: 'bodyweight' }] },
            { exerciseId: 7, sets: [{ weight: 150, reps: 9, unit: 'lbs' }] },
            { exerciseId: 8, sets: [{ weight: 0, reps: 30, unit: 'minutes' }] }
        ],
        pull: [
            { exerciseId: 9, sets: [{ weight: 15, reps: 5.5, unit: 'lbs' }] },
            { exerciseId: 10, sets: [{ weight: 13, reps: 5.5, unit: 'plate' }] },
            { exerciseId: 11, sets: [{ weight: 10, reps: 8, unit: 'kg' }] },
            { exerciseId: 12, sets: [{ weight: 85, reps: 6, unit: 'kg' }] },
            { exerciseId: 13, sets: [{ weight: 40, reps: 5, unit: 'lbs' }] },
            { exerciseId: 14, sets: [{ weight: 90, reps: 5, unit: 'lbs' }] },
            { exerciseId: 15, sets: [{ weight: 45, reps: 8, unit: 'kg' }] },
            { exerciseId: 8, sets: [{ weight: 0, reps: 30, unit: 'minutes' }] }
        ],
        legs: [
            { exerciseId: 16, sets: [{ weight: 55, reps: 5, unit: 'kg' }] },
            { exerciseId: 17, sets: [{ weight: 90, reps: 6, unit: 'kg' }] },
            { exerciseId: 18, sets: [{ weight: 65, reps: 6, unit: 'kg' }] },
            { exerciseId: 19, sets: [{ weight: 85, reps: 6, unit: 'kg' }] },
            { exerciseId: 20, sets: [{ weight: 40, reps: 5, unit: 'kg' }] },
            { exerciseId: 21, sets: [{ weight: 150, reps: 8, unit: 'lbs' }] },
            { exerciseId: 22, sets: [{ weight: 40, reps: 8, unit: 'kg' }] },
            { exerciseId: 7, sets: [{ weight: 150, reps: 9, unit: 'lbs' }] },
            { exerciseId: 8, sets: [{ weight: 0, reps: 20, unit: 'minutes' }] }
        ]
    },
    
    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        this.loadData();
        this.updateDashboard();
        this.renderExerciseLibrary();
        this.populateExerciseSelect();
        this.setupEventListeners();
        
        // Check if there's a saved page
        const savedPage = localStorage.getItem('currentPage');
        if (savedPage && savedPage !== 'landing-page') {
            this.navigateTo(savedPage);
        }
    },
    
    setupEventListeners() {
        // Prevent default form submissions
        document.addEventListener('submit', (e) => e.preventDefault());
    },
    
    // ========================================
    // NAVIGATION
    // ========================================
    navigateTo(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            localStorage.setItem('currentPage', pageId);
            
            // Update content based on page
            if (pageId === 'dashboard') {
                this.updateDashboard();
            } else if (pageId === 'progress') {
                this.updateProgressChart();
            }
        }
    },
    
    // ========================================
    // DATA MANAGEMENT
    // ========================================
    loadData() {
        const data = localStorage.getItem('workoutData');
        if (!data) {
            this.initializeData();
        }
    },
    
    initializeData() {
        const initialData = {
            workouts: [],
            personalRecords: {},
            streak: 0,
            lastWorkoutDate: null
        };
        localStorage.setItem('workoutData', JSON.stringify(initialData));
    },
    
    getData() {
        return JSON.parse(localStorage.getItem('workoutData'));
    },
    
    saveData(data) {
        localStorage.setItem('workoutData', JSON.stringify(data));
    },
    
    // ========================================
    // DASHBOARD
    // ========================================
    updateDashboard() {
        const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
        const workoutSchedule = {
            0: 'push', // Sunday
            1: 'pull', // Monday
            2: 'rest',
            3: 'legs', // Wednesday
            4: 'push', // Thursday
            5: 'pull', // Friday
            6: 'legs'  // Saturday
        };
        
        const todayWorkout = workoutSchedule[today];
        const workoutNames = {
            push: 'Push Day',
            pull: 'Pull Day',
            legs: 'Legs Day',
            rest: 'Rest Day'
        };
        
        document.getElementById('today-workout').textContent = 
            `Today: ${workoutNames[todayWorkout]}`;
        document.getElementById('workout-type').textContent = workoutNames[todayWorkout];
        
        if (todayWorkout === 'rest') {
            document.getElementById('start-workout-btn').disabled = true;
            document.getElementById('start-workout-btn').style.opacity = '0.5';
        } else {
            document.getElementById('start-workout-btn').disabled = false;
            document.getElementById('start-workout-btn').style.opacity = '1';
        }
        
        // Update stats
        const data = this.getData();
        const weeklyVolume = this.calculateWeeklyVolume(data.workouts);
        const prsThisWeek = this.calculatePRsThisWeek(data.workouts, data.personalRecords);
        
        document.getElementById('weekly-volume').textContent = 
            Math.round(weeklyVolume).toLocaleString();
        document.getElementById('prs-count').textContent = prsThisWeek;
        document.getElementById('streak-count').textContent = data.streak || 0;
        
        // Update recent workouts
        this.renderRecentWorkouts(data.workouts);
        
        // Calculate current week
        const weekNumber = Math.floor((Date.now() - new Date(2026, 0, 1)) / (7 * 24 * 60 * 60 * 1000)) + 1;
        document.getElementById('current-week').textContent = weekNumber;
    },
    
    calculateWeeklyVolume(workouts) {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return workouts
            .filter(w => new Date(w.date).getTime() > oneWeekAgo)
            .reduce((total, workout) => {
                return total + (workout.volume || 0);
            }, 0);
    },
    
    calculatePRsThisWeek(workouts, prs) {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        let prCount = 0;
        
        workouts
            .filter(w => new Date(w.date).getTime() > oneWeekAgo)
            .forEach(workout => {
                workout.exercises.forEach(exercise => {
                    exercise.sets.forEach(set => {
                        const prKey = `${exercise.exerciseId}`;
                        const currentPR = prs[prKey] || 0;
                        if (set.weight > currentPR) {
                            prCount++;
                        }
                    });
                });
            });
        
        return prCount;
    },
    
    renderRecentWorkouts(workouts) {
        const container = document.getElementById('recent-workouts-list');
        
        if (workouts.length === 0) {
            container.innerHTML = '<p class="empty-state">No workouts logged yet</p>';
            return;
        }
        
        const recent = workouts.slice(-5).reverse();
        container.innerHTML = recent.map(workout => {
            const date = new Date(workout.date);
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
            
            return `
                <div class="recent-workout-item">
                    <div class="workout-info">
                        <h4>${workout.type.toUpperCase()}</h4>
                        <div class="workout-meta">${formattedDate} • ${workout.exercises.length} exercises</div>
                    </div>
                    <div class="workout-volume">
                        <div class="stat-value" style="font-size: 1.5rem;">${Math.round(workout.volume)}</div>
                        <div class="stat-unit">kg</div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // ========================================
    // WORKOUT FLOW
    // ========================================
    startTodayWorkout() {
        const today = new Date().getDay();
        const workoutSchedule = {
            0: 'push',
            1: 'pull',
            3: 'legs',
            4: 'push',
            5: 'pull',
            6: 'legs'
        };
        
        const todayWorkout = workoutSchedule[today];
        if (todayWorkout) {
            this.navigateTo('workout');
            setTimeout(() => this.loadWorkout(todayWorkout), 100);
        }
    },
    
    loadWorkout(type) {
        this.activeWorkout = {
            type: type,
            exercises: JSON.parse(JSON.stringify(this.programs[type])),
            startTime: Date.now()
        };
        
        this.workoutStartTime = Date.now();
        this.startTimer();
        
        // Update UI
        document.getElementById('workout-selector').style.display = 'none';
        document.getElementById('active-workout').style.display = 'block';
        document.getElementById('active-workout-title').textContent = 
            `${type.toUpperCase()} WORKOUT`;
        
        this.renderWorkoutExercises();
    },
    
    renderWorkoutExercises() {
        const container = document.getElementById('exercises-list');
        container.innerHTML = '';
        
        this.activeWorkout.exercises.forEach((exercise, exIndex) => {
            const exerciseData = this.exercises.find(e => e.id === exercise.exerciseId);
            const lastPerformance = this.getLastPerformance(exercise.exerciseId);
            
            const exerciseBlock = document.createElement('div');
            exerciseBlock.className = 'exercise-block';
            exerciseBlock.innerHTML = `
                <div class="exercise-header">
                    <div>
                        <div class="exercise-name">${exerciseData.name}</div>
                        <div class="exercise-meta">${exerciseData.muscleGroup} • ${exerciseData.equipment}</div>
                    </div>
                </div>
                <div class="exercise-details">
                    ${lastPerformance ? `
                        <div class="last-performance">
                            Last: ${lastPerformance}
                        </div>
                    ` : ''}
                    <div class="sets-container" id="sets-${exIndex}">
                        ${this.renderSets(exercise.sets, exIndex)}
                    </div>
                    <button class="add-set-btn" onclick="app.addSet(${exIndex})">+ ADD SET</button>
                </div>
            `;
            
            container.appendChild(exerciseBlock);
        });
    },
    
    renderSets(sets, exIndex) {
        return sets.map((set, setIndex) => `
            <div class="set-row">
                <div class="set-label">Set ${setIndex + 1}</div>
                <input 
                    type="number" 
                    class="set-input" 
                    placeholder="Weight"
                    value="${set.weight || ''}"
                    onchange="app.updateSet(${exIndex}, ${setIndex}, 'weight', this.value)"
                >
                <input 
                    type="number" 
                    class="set-input" 
                    placeholder="Reps"
                    value="${set.reps || ''}"
                    onchange="app.updateSet(${exIndex}, ${setIndex}, 'reps', this.value)"
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
    
    getLastPerformance(exerciseId) {
        const data = this.getData();
        const workoutsWithExercise = data.workouts.filter(w => 
            w.exercises.some(e => e.exerciseId === exerciseId)
        );
        
        if (workoutsWithExercise.length === 0) return null;
        
        const lastWorkout = workoutsWithExercise[workoutsWithExercise.length - 1];
        const exercise = lastWorkout.exercises.find(e => e.exerciseId === exerciseId);
        
        if (!exercise || exercise.sets.length === 0) return null;
        
        const bestSet = exercise.sets.reduce((best, set) => 
            (set.weight > best.weight) ? set : best
        );
        
        return `${bestSet.weight} ${bestSet.unit} × ${bestSet.reps} reps`;
    },
    
    addSet(exIndex) {
        const lastSet = this.activeWorkout.exercises[exIndex].sets.slice(-1)[0];
        this.activeWorkout.exercises[exIndex].sets.push({
            weight: lastSet.weight,
            reps: lastSet.reps,
            unit: lastSet.unit,
            completed: false
        });
        
        const container = document.getElementById(`sets-${exIndex}`);
        container.innerHTML = this.renderSets(this.activeWorkout.exercises[exIndex].sets, exIndex);
    },
    
    updateSet(exIndex, setIndex, field, value) {
        this.activeWorkout.exercises[exIndex].sets[setIndex][field] = parseFloat(value) || 0;
    },
    
    toggleSetComplete(exIndex, setIndex, completed) {
        this.activeWorkout.exercises[exIndex].sets[setIndex].completed = completed;
    },
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.workoutStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('workout-timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    },
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    finishWorkout() {
        if (!this.activeWorkout) return;
        
        this.stopTimer();
        
        // Calculate total volume
        let totalVolume = 0;
        this.activeWorkout.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                if (set.completed) {
                    // Convert all to kg for consistency
                    let weight = set.weight;
                    if (set.unit === 'lbs') {
                        weight = weight * 0.453592;
                    }
                    totalVolume += weight * set.reps;
                }
            });
        });
        
        const duration = Math.floor((Date.now() - this.workoutStartTime) / 1000);
        
        // Save workout
        const data = this.getData();
        const workout = {
            date: new Date().toISOString(),
            type: this.activeWorkout.type,
            exercises: this.activeWorkout.exercises,
            volume: totalVolume,
            duration: duration
        };
        
        data.workouts.push(workout);
        
        // Update PRs
        this.updatePersonalRecords(data, workout);
        
        // Update streak
        this.updateStreak(data);
        
        this.saveData(data);
        
        // Show summary
        document.getElementById('active-workout').style.display = 'none';
        document.getElementById('workout-summary').style.display = 'block';
        document.getElementById('summary-volume').textContent = `${Math.round(totalVolume)} kg`;
        document.getElementById('summary-duration').textContent = 
            `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
        document.getElementById('summary-exercises').textContent = 
            this.activeWorkout.exercises.length;
        
        this.activeWorkout = null;
    },
    
    cancelWorkout() {
        if (confirm('Are you sure you want to cancel this workout?')) {
            this.stopTimer();
            this.activeWorkout = null;
            document.getElementById('active-workout').style.display = 'none';
            document.getElementById('workout-selector').style.display = 'grid';
        }
    },
    
    updatePersonalRecords(data, workout) {
        if (!data.personalRecords) {
            data.personalRecords = {};
        }
        
        workout.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                if (set.completed) {
                    const prKey = `${exercise.exerciseId}`;
                    const currentPR = data.personalRecords[prKey] || 0;
                    
                    // Convert to kg for comparison
                    let weight = set.weight;
                    if (set.unit === 'lbs') {
                        weight = weight * 0.453592;
                    }
                    
                    if (weight > currentPR) {
                        data.personalRecords[prKey] = weight;
                    }
                }
            });
        });
    },
    
    updateStreak(data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (data.lastWorkoutDate) {
            const lastDate = new Date(data.lastWorkoutDate);
            lastDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((today - lastDate) / (24 * 60 * 60 * 1000));
            
            if (daysDiff === 0) {
                // Same day, don't update streak
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
    
    // ========================================
    // PROGRESS TRACKING
    // ========================================
    populateExerciseSelect() {
        const select = document.getElementById('exercise-select');
        this.exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.id;
            option.textContent = exercise.name;
            select.appendChild(option);
        });
    },
    
    updateProgressChart() {
        const exerciseId = parseInt(document.getElementById('exercise-select').value);
        const timeRange = parseInt(document.getElementById('time-range').value);
        
        if (!exerciseId) {
            this.clearChart();
            return;
        }
        
        const data = this.getData();
        const cutoffDate = Date.now() - (timeRange * 24 * 60 * 60 * 1000);
        
        // Filter workouts for selected exercise
        const exerciseHistory = [];
        data.workouts.forEach(workout => {
            if (new Date(workout.date).getTime() < cutoffDate) return;
            
            const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
            if (exercise) {
                exercise.sets.forEach(set => {
                    if (set.completed) {
                        exerciseHistory.push({
                            date: new Date(workout.date),
                            weight: set.weight,
                            reps: set.reps
                        });
                    }
                });
            }
        });
        
        this.renderChart(exerciseHistory);
        this.updateMuscleVolumeChart(data);
    },
    
    renderChart(history) {
        const canvas = document.getElementById('progress-chart');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;
        
        if (history.length === 0) {
            ctx.fillStyle = '#606060';
            ctx.font = '16px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions
        const padding = 60;
        const graphWidth = canvas.width - (padding * 2);
        const graphHeight = canvas.height - (padding * 2);
        
        // Find min/max values
        const weights = history.map(h => h.weight);
        const maxWeight = Math.max(...weights);
        const minWeight = Math.min(...weights);
        const weightRange = maxWeight - minWeight || 1;
        
        // Draw axes
        ctx.strokeStyle = '#252525';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw grid lines
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (graphHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = maxWeight - (weightRange / 5) * i;
            ctx.fillStyle = '#a0a0a0';
            ctx.font = '12px "JetBrains Mono"';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value) + ' kg', padding - 10, y + 5);
        }
        
        // Draw line
        ctx.strokeStyle = '#ff3b3b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        history.forEach((point, index) => {
            const x = padding + (graphWidth / (history.length - 1 || 1)) * index;
            const y = canvas.height - padding - ((point.weight - minWeight) / weightRange) * graphHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        history.forEach((point, index) => {
            const x = padding + (graphWidth / (history.length - 1 || 1)) * index;
            const y = canvas.height - padding - ((point.weight - minWeight) / weightRange) * graphHeight;
            
            ctx.fillStyle = '#ff3b3b';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    
    clearChart() {
        const canvas = document.getElementById('progress-chart');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#606060';
        ctx.font = '16px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('Select an exercise to view progress', canvas.width / 2, canvas.height / 2);
    },
    
    updateMuscleVolumeChart(data) {
        const muscleGroups = ['Push', 'Pull', 'Legs', 'Abs', 'Cardio'];
        const volumeByMuscle = {};
        
        muscleGroups.forEach(group => {
            volumeByMuscle[group] = 0;
        });
        
        // Calculate volume for last 30 days
        const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        data.workouts.forEach(workout => {
            if (new Date(workout.date).getTime() < cutoffDate) return;
            
            workout.exercises.forEach(exercise => {
                const exerciseData = this.exercises.find(e => e.id === exercise.exerciseId);
                if (!exerciseData) return;
                
                exercise.sets.forEach(set => {
                    if (set.completed) {
                        let weight = set.weight;
                        if (set.unit === 'lbs') {
                            weight = weight * 0.453592;
                        }
                        volumeByMuscle[exerciseData.muscleGroup] += weight * set.reps;
                    }
                });
            });
        });
        
        const maxVolume = Math.max(...Object.values(volumeByMuscle), 1);
        const container = document.getElementById('muscle-volume-chart');
        
        container.innerHTML = muscleGroups.map(group => {
            const volume = volumeByMuscle[group];
            const percentage = (volume / maxVolume) * 100;
            
            return `
                <div class="muscle-volume-bar">
                    <div class="muscle-label">${group}</div>
                    <div class="volume-bar">
                        <div class="volume-fill" style="width: ${percentage}%">
                            <span class="volume-value">${Math.round(volume)} kg</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // ========================================
    // EXERCISE LIBRARY
    // ========================================
    renderExerciseLibrary() {
        const container = document.getElementById('exercise-library-list');
        
        container.innerHTML = this.exercises.map(exercise => {
            return `
                <div class="exercise-card">
                    <div class="exercise-card-name">${exercise.name}</div>
                    <div class="exercise-card-meta">
                        <span class="exercise-card-tag">${exercise.muscleGroup}</span>
                        <span class="exercise-card-tag">${exercise.equipment}</span>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    filterExercises() {
        const searchTerm = document.getElementById('exercise-search').value.toLowerCase();
        const muscleFilter = document.getElementById('muscle-filter').value;
        
        const filtered = this.exercises.filter(exercise => {
            const matchesSearch = exercise.name.toLowerCase().includes(searchTerm);
            const matchesMuscle = !muscleFilter || exercise.muscleGroup === muscleFilter;
            return matchesSearch && matchesMuscle;
        });
        
        const container = document.getElementById('exercise-library-list');
        
        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">No exercises found</p>';
            return;
        }
        
        container.innerHTML = filtered.map(exercise => {
            return `
                <div class="exercise-card">
                    <div class="exercise-card-name">${exercise.name}</div>
                    <div class="exercise-card-meta">
                        <span class="exercise-card-tag">${exercise.muscleGroup}</span>
                        <span class="exercise-card-tag">${exercise.equipment}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// ========================================
// INITIALIZE APP
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});