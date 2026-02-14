// script.js - Main Application Entry Point
import { WorkoutService } from './services/WorkoutService.js';
import { StorageService } from './services/StorageService.js';
import { UIService } from './services/UIService.js';
import { NotificationService } from './services/NotificationService.js';
import { ExerciseLibrary } from './data/exercises.js';
import { workoutPrograms, workoutSchedule } from './data/workoutPrograms.js';

class OverloadApp {
    // Private fields
    #workoutService;
    #storageService;
    #uiService;
    #notificationService;
    #currentUser = null;
    #currentWorkout = null;
    #timerInterval = null;
    #restTimerInterval = null;
    #isLoading = true;

    constructor() {
        this.#initializeServices();
        this.#setupEventListeners();
        this.#initializeApp();
    }

    // Destructuring in method parameters
    #initializeServices() {
        const config = {
            apiUrl: window.location.origin,
            version: '1.0.0',
            theme: 'dark'
        };

        // Destructuring assignment
        const { apiUrl, version, theme } = config;
        
        console.log(`🚀 Initializing Overload v${version}`, { apiUrl, theme });

        this.#storageService = new StorageService();
        this.#notificationService = new NotificationService();
        this.#workoutService = new WorkoutService(this.#storageService);
        this.#uiService = new UIService(this.#notificationService);
    }

    async #initializeApp() {
        try {
            // Show loading state
            this.#uiService.showLoading();
            
            // Async/await with Promise
            const userData = await this.#fetchUserData();
            
            // Optional chaining and nullish coalescing
            this.#currentUser = {
                name: userData?.name ?? 'Athlete',
                streak: userData?.streak ?? 0,
                lastWorkout: userData?.lastWorkout ?? null,
                preferences: userData?.preferences ?? { restTimer: 90 }
            };

            // Spread operator - copy and merge
            const defaultSettings = { theme: 'dark', notifications: true, restTimer: 90 };
            const userSettings = { ...defaultSettings, ...this.#currentUser.preferences };
            
            this.#uiService.applySettings(userSettings);
            this.#renderApp();
            
        } catch (error) {
            this.#notificationService.show('Failed to initialize app', 'error');
            console.error('Initialization error:', error);
        } finally {
            this.#isLoading = false;
            this.#uiService.hideLoading();
        }
    }

    async #fetchUserData() {
        // Simulate API call with Promise
        return new Promise((resolve) => {
            setTimeout(() => {
                const stored = this.#storageService.get('user_profile');
                resolve(stored ?? null);
            }, 1000);
        });
    }

    #setupEventListeners() {
        // Event delegation for better performance
        document.addEventListener('click', (e) => {
            const { target } = e;
            
            // Use optional chaining and logical AND
            const action = target?.dataset?.action;
            action && this.#handleActions(action, target);
        });

        // Handle offline/online events
        window.addEventListener('online', () => {
            this.#notificationService.show('Back online! Syncing data...', 'success');
            this.#syncData();
        });

        window.addEventListener('offline', () => {
            this.#notificationService.show('You are offline. Changes will sync when connection returns.', 'warning');
        });
    }

    #handleActions(action, target) {
        // Object literal as action map (better than switch)
        const actions = {
            'navigate': () => this.#navigateTo(target.dataset.page),
            'start-workout': () => this.#startWorkout(target.dataset.type),
            'finish-workout': () => this.#finishWorkout(),
            'cancel-workout': () => this.#cancelWorkout(),
            'add-set': () => this.#addSet(target.dataset.exerciseIndex),
            'toggle-exercise': () => this.#toggleExercise(target.dataset.exerciseIndex),
            'save-settings': () => this.#saveSettings(),
            'export-data': () => this.#exportData(),
            'import-data': () => this.#importData()
        };

        // Optional chaining and nullish coalescing
        const handler = actions[action] ?? (() => console.log('Unknown action:', action));
        handler();
    }

    #navigateTo(page) {
        // Array methods - filter and map
        const validPages = ['dashboard', 'workout', 'progress', 'exercises', 'settings'];
        const isValid = validPages.includes(page);
        
        if (!isValid) {
            this.#notificationService.show('Invalid page', 'error');
            return;
        }

        this.#uiService.renderPage(page, {
            // Pass data using spread
            ...this.#getPageData(page),
            user: this.#currentUser,
            isLoading: this.#isLoading
        });

        // Update URL without reload
        history.pushState({ page }, '', `#${page}`);
    }

    #getPageData(page) {
        // Object with computed properties
        const dataGetters = {
            dashboard: () => ({
                stats: this.#workoutService.getStats(),
                todayWorkout: workoutSchedule[new Date().getDay()],
                recentWorkouts: this.#workoutService.getRecentWorkouts(5)
            }),
            workout: () => ({
                programs: workoutPrograms,
                activeWorkout: this.#currentWorkout
            }),
            progress: () => ({
                history: this.#workoutService.getWorkoutHistory(),
                exercises: ExerciseLibrary
            }),
            exercises: () => ({
                exercises: ExerciseLibrary,
                categories: [...new Set(ExerciseLibrary.map(ex => ex.muscleGroup))] // Spread with Set
            })
        };

        // Optional chaining
        return dataGetters[page]?.() ?? {};
    }

    async #startWorkout(type) {
        // Guard clause with logical AND
        const isValidWorkout = workoutPrograms[type] && !this.#currentWorkout;
        if (!isValidWorkout) {
            this.#notificationService.show('Cannot start workout', 'error');
            return;
        }

        try {
            // Destructure workout program
            const program = workoutPrograms[type];
            
            // Map to create workout structure
            this.#currentWorkout = {
                id: crypto.randomUUID(),
                type,
                startTime: Date.now(),
                // Array map method
                exercises: program.map(exercise => ({
                    ...exercise, // Spread operator
                    sets: Array.from({ length: exercise.sets }, (_, i) => ({
                        setNumber: i + 1,
                        weight: exercise.targetWeight,
                        reps: exercise.targetReps,
                        completed: false,
                        unit: exercise.unit
                    }))
                }))
            };

            this.#startTimer();
            this.#uiService.renderActiveWorkout(this.#currentWorkout);
            
            // Async operation example
            await this.#workoutService.logWorkoutStart(this.#currentWorkout);
            
            this.#notificationService.show(`${type.toUpperCase()} workout started!`, 'success');
            
        } catch (error) {
            this.#notificationService.show('Failed to start workout', 'error');
            console.error('Workout start error:', error);
        }
    }

    #startTimer() {
        // Clear existing interval
        this.#timerInterval?.(); // Optional chaining with function call
        
        let seconds = 0;
        this.#timerInterval = setInterval(() => {
            seconds++;
            this.#uiService.updateWorkoutTimer(seconds);
        }, 1000);
    }

    #startRestTimer() {
        // Stop existing rest timer
        if (this.#restTimerInterval) {
            clearInterval(this.#restTimerInterval);
        }

        const restDuration = this.#currentWorkout?.preferences?.restTimer ?? 90;
        let timeLeft = restDuration;

        this.#uiService.showRestTimer(timeLeft);

        this.#restTimerInterval = setInterval(() => {
            timeLeft--;
            
            // Ternary operator for display
            this.#uiService.updateRestTimer(timeLeft);
            
            // Logical AND for timer end
            timeLeft <= 0 && this.#stopRestTimer(true);
            
        }, 1000);
    }

    #stopRestTimer(playSound = false) {
        if (this.#restTimerInterval) {
            clearInterval(this.#restTimerInterval);
            this.#restTimerInterval = null;
            this.#uiService.hideRestTimer();
            
            // Play sound if timer completed
            playSound && this.#playTimerSound();
        }
    }

    #playTimerSound() {
        // Optional chaining with Audio API
        const audio = new Audio('/sounds/timer.mp3');
        audio?.play().catch(() => {
            // Fallback if audio fails
            this.#notificationService.show('Rest complete!', 'info');
        });
    }

    async #finishWorkout() {
        if (!this.#currentWorkout) return;

        try {
            // Stop timers
            clearInterval(this.#timerInterval);
            this.#stopRestTimer();

            // Calculate workout stats using array methods
            const workoutData = {
                ...this.#currentWorkout,
                endTime: Date.now(),
                duration: Math.floor((Date.now() - this.#currentWorkout.startTime) / 1000),
                // Array reduce method for total volume
                totalVolume: this.#currentWorkout.exercises.reduce((total, exercise) => {
                    return total + exercise.sets.reduce((exTotal, set) => {
                        return exTotal + (set.completed ? (set.weight * set.reps) : 0);
                    }, 0);
                }, 0),
                // Array filter method for completed sets
                completedSets: this.#currentWorkout.exercises.reduce((total, ex) => {
                    return total + ex.sets.filter(s => s.completed).length;
                }, 0)
            };

            // Save workout
            await this.#workoutService.saveWorkout(workoutData);
            
            // Update personal records (array find method)
            workoutData.exercises.forEach(exercise => {
                const exerciseData = ExerciseLibrary.find(e => e.id === exercise.exerciseId);
                const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
                
                if (maxWeight > (exerciseData?.personalRecord ?? 0)) {
                    this.#notificationService.show(`New PR on ${exerciseData?.name}! 🏆`, 'success');
                }
            });

            // Clear current workout
            this.#currentWorkout = null;
            
            // Show summary
            this.#uiService.showWorkoutSummary(workoutData);
            
            // Update streak
            this.#updateStreak();
            
        } catch (error) {
            this.#notificationService.show('Failed to save workout', 'error');
            console.error('Workout save error:', error);
        }
    }

    #updateStreak() {
        // Complex streak calculation using array methods
        const workouts = this.#storageService.get('workouts') ?? [];
        const today = new Date().setHours(0, 0, 0, 0);
        
        // Find if worked out today
        const workedOutToday = workouts.some(w => {
            const workoutDate = new Date(w.date).setHours(0, 0, 0, 0);
            return workoutDate === today;
        });

        if (workedOutToday) {
            // Calculate streak using filter
            let streak = 1;
            let checkDate = today - 86400000; // Yesterday
            
            while (true) {
                const hasWorkout = workouts.some(w => {
                    const workoutDate = new Date(w.date).setHours(0, 0, 0, 0);
                    return workoutDate === checkDate;
                });
                
                if (!hasWorkout) break;
                
                streak++;
                checkDate -= 86400000;
            }
            
            this.#currentUser.streak = streak;
            this.#storageService.set('user_profile', this.#currentUser);
            this.#uiService.updateStreak(streak);
        }
    }

    #cancelWorkout() {
        // Ternary with confirmation
        const confirmed = confirm('Are you sure you want to cancel this workout?');
        confirmed && this.#resetWorkout();
    }

    #resetWorkout() {
        clearInterval(this.#timerInterval);
        this.#stopRestTimer();
        this.#currentWorkout = null;
        this.#uiService.resetWorkoutView();
        this.#notificationService.show('Workout cancelled', 'info');
    }

    #addSet(exerciseIndex) {
        // Guard clause
        if (!this.#currentWorkout?.exercises[exerciseIndex]) return;

        const exercise = this.#currentWorkout.exercises[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];
        
        // Create new set with spread
        const newSet = {
            ...lastSet,
            setNumber: exercise.sets.length + 1,
            completed: false
        };

        // Push with immutability (spread)
        exercise.sets = [...exercise.sets, newSet];
        
        // Re-render
        this.#uiService.updateExerciseSets(exerciseIndex, exercise.sets);
    }

    #toggleExercise(exerciseIndex) {
        // Toggle using logical NOT
        this.#uiService.toggleExerciseBody(exerciseIndex);
    }

    async #syncData() {
        try {
            // Get unsynced data
            const unsynced = this.#storageService.get('unsynced_workouts') ?? [];
            
            if (unsynced.length === 0) return;
            
            this.#uiService.showSyncStatus('syncing');
            
            // Promise.all for parallel sync
            await Promise.all(unsynced.map(workout => 
                this.#workoutService.syncWorkout(workout)
            ));
            
            this.#storageService.remove('unsynced_workouts');
            this.#uiService.showSyncStatus('complete');
            this.#notificationService.show('All data synced!', 'success');
            
        } catch (error) {
            this.#uiService.showSyncStatus('error');
            this.#notificationService.show('Sync failed, will retry later', 'warning');
        }
    }

    #exportData() {
        // Get all user data
        const userData = {
            profile: this.#currentUser,
            workouts: this.#storageService.get('workouts') ?? [],
            preferences: this.#storageService.get('preferences') ?? {},
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `overload-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        this.#notificationService.show('Data exported successfully', 'success');
    }

    async #importData() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const importedData = JSON.parse(text);
                
                // Validate imported data
                const isValid = importedData?.version && importedData?.workouts;
                
                if (!isValid) {
                    throw new Error('Invalid import file');
                }
                
                // Merge with existing data
                const existingWorkouts = this.#storageService.get('workouts') ?? [];
                const mergedWorkouts = [...existingWorkouts, ...importedData.workouts];
                
                this.#storageService.set('workouts', mergedWorkouts);
                this.#notificationService.show(`Imported ${importedData.workouts.length} workouts`, 'success');
                
                // Refresh current view
                this.#renderApp();
                
            } catch (error) {
                this.#notificationService.show('Failed to import data', 'error');
                console.error('Import error:', error);
            }
        };
        
        input.click();
    }

    #saveSettings() {
        // Get settings from UI
        const settings = this.#uiService.getSettings();
        
        // Save with spread
        this.#currentUser = {
            ...this.#currentUser,
            preferences: settings
        };
        
        this.#storageService.set('user_profile', this.#currentUser);
        this.#notificationService.show('Settings saved', 'success');
    }

    #renderApp() {
        const currentPage = window.location.hash.slice(1) || 'dashboard';
        this.#navigateTo(currentPage);
    }
}

// Initialize app
const app = new OverloadApp();

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    const page = e.state?.page || 'dashboard';
    app.#navigateTo(page);
});