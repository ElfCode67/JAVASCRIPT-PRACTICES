// services/WorkoutService.js
export class WorkoutService {
    #storage;

    constructor(storageService) {
        this.#storage = storageService;
    }

    // Get statistics using array methods
    getStats() {
        const workouts = this.#storage.get('workouts') ?? [];
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

        // Filter weekly workouts
        const weeklyWorkouts = workouts.filter(w => new Date(w.date).getTime() > weekAgo);

        // Calculate totals using reduce
        const weeklyVolume = weeklyWorkouts.reduce((total, w) => total + (w.totalVolume || 0), 0);
        const totalWorkouts = workouts.length;
        const avgVolume = totalWorkouts ? 
            workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0) / totalWorkouts : 0;

        // Find PRs using map and reduce
        const prs = this.#calculatePRs(workouts);

        return {
            weeklyVolume,
            totalWorkouts,
            avgVolume: Math.round(avgVolume),
            prs,
            streak: this.#storage.get('user_profile')?.streak ?? 0
        };
    }

    // Get recent workouts
    getRecentWorkouts(limit = 5) {
        const workouts = this.#storage.get('workouts') ?? [];
        return workouts.slice(-limit).reverse();
    }

    // Get workout history for chart
    getWorkoutHistory(exerciseId = null) {
        const workouts = this.#storage.get('workouts') ?? [];
        
        if (!exerciseId) {
            return workouts;
        }

        // Filter and map specific exercise
        return workouts
            .map(workout => ({
                date: workout.date,
                exercises: workout.exercises.filter(e => e.exerciseId === exerciseId)
            }))
            .filter(w => w.exercises.length > 0);
    }

    // Save workout
    async saveWorkout(workout) {
        const workouts = this.#storage.get('workouts') ?? [];
        workouts.push(workout);
        this.#storage.set('workouts', workouts);
        
        // Update PRs
        this.#updatePRs(workout);
        
        return workout;
    }

    // Log workout start
    async logWorkoutStart(workout) {
        console.log('Workout started:', workout.id);
        return true;
    }

    // Sync workout (for offline support)
    async syncWorkout(workout) {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Synced workout:', workout.id);
                resolve(true);
            }, 1000);
        });
    }

    // Calculate PRs using array methods
    #calculatePRs(workouts) {
        const prs = {};
        
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (set.completed) {
                        const key = `ex_${exercise.exerciseId}`;
                        const volume = set.weight * set.reps;
                        
                        // Update PR if higher
                        if (!prs[key] || volume > prs[key]) {
                            prs[key] = volume;
                        }
                    }
                });
            });
        });

        return prs;
    }

    // Update PRs
    #updatePRs(workout) {
        const prs = this.#storage.get('prs') ?? {};
        
        workout.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                if (set.completed) {
                    const key = `ex_${exercise.exerciseId}`;
                    const volume = set.weight * set.reps;
                    
                    if (!prs[key] || volume > prs[key]) {
                        prs[key] = volume;
                    }
                }
            });
        });
        
        this.#storage.set('prs', prs);
    }
}