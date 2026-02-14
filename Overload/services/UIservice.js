// services/UIService.js
export class UIService {
    #notificationService;
    #currentPage = null;
    #elements = {};

    constructor(notificationService) {
        this.#notificationService = notificationService;
        this.#initializeElements();
    }

    #initializeElements() {
        // Create main app container
        this.#elements.app = document.getElementById('app');
        this.#elements.loadingOverlay = this.#createLoadingOverlay();
        this.#elements.toastContainer = this.#createToastContainer();
        
        // Append to body
        document.body.appendChild(this.#elements.loadingOverlay);
        document.body.appendChild(this.#elements.toastContainer);
    }

    #createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const spinner = document.createElement('div');
        spinner.className = 'skeleton';
        spinner.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
        `;
        
        overlay.appendChild(spinner);
        return overlay;
    }

    #createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        return container;
    }

    // Render page based on name
    renderPage(pageName, data) {
        this.#currentPage = pageName;
        
        const renderers = {
            dashboard: () => this.#renderDashboard(data),
            workout: () => this.#renderWorkout(data),
            progress: () => this.#renderProgress(data),
            exercises: () => this.#renderExercises(data),
            settings: () => this.#renderSettings(data)
        };

        const renderer = renderers[pageName] ?? (() => this.#renderNotFound());
        this.#elements.app.innerHTML = renderer();
        
        // Update active nav
        this.#updateActiveNav(pageName);
    }

    #renderDashboard(data) {
        const { stats, todayWorkout, recentWorkouts } = data;
        
        return `
            <nav class="navbar">
                <div class="nav-brand">OVERLOAD</div>
                <div class="nav-menu">
                    ${this.#renderNavItems('dashboard')}
                </div>
            </nav>
            
            <div class="container">
                <div class="section-header">
                    <h1>Dashboard</h1>
                    <div class="date-badge">${new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats?.weeklyVolume?.toLocaleString() ?? 0}</div>
                        <div class="stat-label">Weekly Volume (kg)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Object.keys(stats?.prs ?? {}).length}</div>
                        <div class="stat-label">Personal Records</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats?.streak ?? 0}</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats?.totalWorkouts ?? 0}</div>
                        <div class="stat-label">Total Workouts</div>
                    </div>
                </div>
                
                <button class="btn" data-action="start-workout" data-type="${todayWorkout ?? ''}" 
                        ${!todayWorkout ? 'disabled' : ''}>
                    ${todayWorkout ? `START ${todayWorkout.toUpperCase()} WORKOUT` : 'REST DAY'}
                </button>
                
                <div class="section">
                    <h2>Recent Workouts</h2>
                    ${this.#renderRecentWorkouts(recentWorkouts)}
                </div>
            </div>
        `;
    }

    #renderWorkout(data) {
        const { programs, activeWorkout } = data;
        
        if (activeWorkout) {
            return this.#renderActiveWorkout(activeWorkout);
        }

        return `
            <nav class="navbar">
                <div class="nav-brand">OVERLOAD</div>
                <div class="nav-menu">
                    ${this.#renderNavItems('workout')}
                </div>
            </nav>
            
            <div class="container">
                <h1>Select Workout</h1>
                
                <div class="workout-grid">
                    ${Object.entries(programs).map(([type, exercises]) => `
                        <div class="workout-card" data-action="start-workout" data-type="${type}">
                            <h3>${type.toUpperCase()}</h3>
                            <div class="schedule">${exercises.length} exercises</div>
                            <div class="schedule">${this.#getWorkoutSchedule(type)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    #renderActiveWorkout(workout) {
        return `
            <nav class="navbar">
                <div class="nav-brand">OVERLOAD</div>
                <div class="nav-menu">
                    <button class="nav-item" data-action="navigate" data-page="workout">Workout</button>
                </div>
            </nav>
            
            <div class="container">
                <div class="workout-header">
                    <div>
                        <h1>${workout.type.toUpperCase()} WORKOUT</h1>
                        <div class="workout-timer" id="workout-timer">00:00</div>
                    </div>
                    <div class="workout-actions">
                        <button class="btn" data-action="finish-workout">Finish</button>
                        <button class="btn btn-secondary" data-action="cancel-workout">Cancel</button>
                    </div>
                </div>
                
                <div id="rest-timer" class="rest-timer" style="display: none;">
                    <div class="timer-display" id="rest-display">01:30</div>
                    <div class="timer-controls">
                        <button class="btn btn-secondary" id="pause-rest">Pause</button>
                        <button class="btn btn-secondary" id="skip-rest">Skip</button>
                    </div>
                </div>
                
                <div class="exercises-container">
                    ${workout.exercises.map((exercise, index) => `
                        <div class="exercise-block">
                            <div class="exercise-header" data-action="toggle-exercise" data-exercise-index="${index}">
                                <span class="exercise-name">${exercise.name}</span>
                                <span class="exercise-meta">
                                    <span>${exercise.muscleGroup}</span>
                                    <span>${exercise.equipment}</span>
                                </span>
                            </div>
                            <div class="exercise-body" id="exercise-body-${index}">
                                ${this.#renderSets(exercise.sets, index)}
                                <button class="btn btn-secondary" data-action="add-set" 
                                        data-exercise-index="${index}">+ Add Set</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    #renderSets(sets, exerciseIndex) {
        return `
            <div class="sets-container" id="sets-${exerciseIndex}">
                ${sets.map((set, setIndex) => `
                    <div class="set-row">
                        <span class="set-number">Set ${set.setNumber}</span>
                        <input type="number" class="set-input" value="${set.weight}" 
                               placeholder="Weight" step="0.5" 
                               data-exercise="${exerciseIndex}" data-set="${setIndex}" data-field="weight">
                        <input type="number" class="set-input" value="${set.reps}" 
                               placeholder="Reps" step="0.5"
                               data-exercise="${exerciseIndex}" data-set="${setIndex}" data-field="reps">
                        <input type="checkbox" class="set-checkbox" 
                               ${set.completed ? 'checked' : ''}
                               data-exercise="${exerciseIndex}" data-set="${setIndex}" data-field="completed">
                    </div>
                `).join('')}
            </div>
        `;
    }

    #renderProgress(data) {
        const { history, exercises } = data;
        
        return `
            <nav class="navbar">
                <div class="nav-brand">OVERLOAD</div>
                <div class="nav-menu">
                    ${this.#renderNavItems('progress')}
                </div>
            </nav>
            
            <div class="container">
                <h1>Progress Tracking</h1>
                
                <div class="chart-controls">
                    <select class="filter-select" id="exercise-select">
                        <option value="">Select Exercise</option>
                        ${exercises.map(ex => `
                            <option value="${ex.id}">${ex.name}</option>
                        `).join('')}
                    </select>
                    
                    <select class="filter-select" id="range-select">
                        <option value="7">Last 7 Days</option>
                        <option value="30" selected>Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="365">Last Year</option>
                    </select>
                </div>
                
                <div class="chart-container">
                    <canvas id="progress-chart"></canvas>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${this.#calculateVolumeByMuscle(history, 'Push')}</div>
                        <div class="stat-label">Push Volume</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.#calculateVolumeByMuscle(history, 'Pull')}</div>
                        <div class="stat-label">Pull Volume</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.#calculateVolumeByMuscle(history, 'Legs')}</div>
                        <div class="stat-label">Legs Volume</div>
                    </div>
                </div>
            </div>
        `;
    }

    #renderExercises(data) {
        const { exercises, categories } = data;
        
        return `
            <nav class="navbar">
                <div class="nav-brand">OVERLOAD</div>
                <div class="nav-menu">
                    ${this.#renderNavItems('exercises')}
                </div>
            </nav>
            
            <div class="container">
                <h1>Exercise Library</h1>
                
                <div class="exercise-filters">
                    <input type="text" class="search-input" id="exercise-search" 
                           placeholder="Search exercises...">
                    <select class="filter-select" id="muscle-filter">
                        <option value="">All Muscle Groups</option>
                        ${categories.map(cat => `
                            <option value="${cat}">${cat}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="exercise-grid" id="exercise-grid">
                    ${exercises.map(ex => `
                        <div class="workout-card" data-exercise-id="${ex.id}">
                            <h3>${ex.name}</h3>
                            <div class="schedule">${ex.muscleGroup}</div>
                            <div class="schedule">${ex.equipment}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    #renderNavItems(activePage) {
        const items = [
            { page: 'dashboard', label: 'Dashboard' },
            { page: 'workout', label: 'Workout' },
            { page: 'progress', label: 'Progress' },
            { page: 'exercises', label: 'Exercises' },
            { page: 'settings', label: 'Settings' }
        ];

        return items.map(item => `
            <button class="nav-item ${activePage === item.page ? 'active' : ''}" 
                    data-action="navigate" data-page="${item.page}">
                ${item.label}
            </button>
        `).join('');
    }

    #renderRecentWorkouts(workouts) {
        if (!workouts?.length) {
            return '<p class="empty-state">No workouts yet. Start your journey today!</p>';
        }

        return workouts.map(workout => `
            <div class="workout-card" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3>${workout.type.toUpperCase()}</h3>
                        <div class="schedule">${new Date(workout.date).toLocaleDateString()}</div>
                    </div>
                    <div class="stat-value">${Math.round(workout.totalVolume)} kg</div>
                </div>
            </div>
        `).join('');
    }

    #getWorkoutSchedule(type) {
        const schedule = {
            push: 'Sun / Thu',
            pull: 'Mon / Fri',
            legs: 'Wed / Sat'
        };
        return schedule[type] ?? 'Rest days: Tue';
    }

    #calculateVolumeByMuscle(history, muscleGroup) {
        // Filter and reduce to calculate volume
        const volume = history
            ?.filter(w => w.type?.toLowerCase() === muscleGroup.toLowerCase())
            ?.reduce((total, w) => total + (w.totalVolume || 0), 0) ?? 0;
            
        return Math.round(volume).toLocaleString();
    }

    #updateActiveNav(activePage) {
        // Will be handled by event listeners
    }

    // UI Helper Methods
    showLoading() {
        this.#elements.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.#elements.loadingOverlay.style.display = 'none';
    }

    updateWorkoutTimer(seconds) {
        const timer = document.getElementById('workout-timer');
        if (timer) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    showRestTimer(timeLeft) {
        const timer = document.getElementById('rest-timer');
        const display = document.getElementById('rest-display');
        
        if (timer && display) {
            timer.style.display = 'block';
            this.updateRestTimer(timeLeft);
        }
    }

    updateRestTimer(seconds) {
        const display = document.getElementById('rest-display');
        if (display) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    hideRestTimer() {
        const timer = document.getElementById('rest-timer');
        if (timer) {
            timer.style.display = 'none';
        }
    }

    updateExerciseSets(exerciseIndex, sets) {
        const container = document.getElementById(`sets-${exerciseIndex}`);
        if (container) {
            container.innerHTML = this.#renderSets(sets, exerciseIndex);
        }
    }

    toggleExerciseBody(exerciseIndex) {
        const body = document.getElementById(`exercise-body-${exerciseIndex}`);
        if (body) {
            const isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'block' : 'none';
        }
    }

    showWorkoutSummary(workout) {
        this.#elements.app.innerHTML = `
            <div class="container" style="text-align: center; padding: 50px 20px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🏆</div>
                <h1>Workout Complete!</h1>
                
                <div class="stats-grid" style="margin: 40px 0;">
                    <div class="stat-card">
                        <div class="stat-value">${Math.round(workout.totalVolume)}</div>
                        <div class="stat-label">Total Volume (kg)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${workout.completedSets}</div>
                        <div class="stat-label">Sets Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.#formatDuration(workout.duration)}</div>
                        <div class="stat-label">Duration</div>
                    </div>
                </div>
                
                <button class="btn" data-action="navigate" data-page="dashboard">
                    Back to Dashboard
                </button>
            </div>
        `;
    }

    resetWorkoutView() {
        this.renderPage('workout', {
            programs: workoutPrograms,
            activeWorkout: null
        });
    }

    updateStreak(streak) {
        // Update streak display if on dashboard
        const streakElement = document.querySelector('[data-streak]');
        if (streakElement) {
            streakElement.textContent = streak;
        }
    }

    applySettings(settings) {
        // Apply theme etc.
        if (settings.theme) {
            document.body.setAttribute('data-theme', settings.theme);
        }
    }

    getSettings() {
        return {
            restTimer: parseInt(document.getElementById('rest-timer-setting')?.value) ?? 90,
            notifications: document.getElementById('notifications-setting')?.checked ?? true,
            theme: document.getElementById('theme-setting')?.value ?? 'dark'
        };
    }

    showSyncStatus(status) {
        // Could show a small indicator
        console.log('Sync status:', status);
    }

    #formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}