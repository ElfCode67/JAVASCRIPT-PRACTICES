/**
 * LIFT - Simple Weight Tracker
 * One page, button-based weight progression
 */

const app = {
    // =============================================
    // STATE
    // =============================================
    currentUnit: 'kg', // 'kg' or 'lb'
    
    // Exercise data structure
    exercises: {
        push: [
            { id: 'push1', name: 'Bench Press', weight: 60, unit: 'kg' },
            { id: 'push2', name: 'Shoulder Press', weight: 40, unit: 'kg' },
            { id: 'push3', name: 'Incline Dumbbell Press', weight: 24, unit: 'kg' },
            { id: 'push4', name: 'Dips', weight: 15, unit: 'kg' },
            { id: 'push5', name: 'Tricep Pushdown', weight: 35, unit: 'kg' },
            { id: 'push6', name: 'Lateral Raises', weight: 12, unit: 'kg' }
        ],
        pull: [
            { id: 'pull1', name: 'Deadlift', weight: 100, unit: 'kg' },
            { id: 'pull2', name: 'Pull-Ups', weight: 10, unit: 'kg' },
            { id: 'pull3', name: 'Barbell Row', weight: 70, unit: 'kg' },
            { id: 'pull4', name: 'Lat Pulldown', weight: 55, unit: 'kg' },
            { id: 'pull5', name: 'Face Pulls', weight: 25, unit: 'kg' },
            { id: 'pull6', name: 'Bicep Curls', weight: 15, unit: 'kg' }
        ],
        legs: [
            { id: 'legs1', name: 'Squat', weight: 80, unit: 'kg' },
            { id: 'legs2', name: 'Romanian Deadlift', weight: 70, unit: 'kg' },
            { id: 'legs3', name: 'Leg Press', weight: 140, unit: 'kg' },
            { id: 'legs4', name: 'Leg Extensions', weight: 50, unit: 'kg' },
            { id: 'legs5', name: 'Leg Curls', weight: 45, unit: 'kg' },
            { id: 'legs6', name: 'Calf Raises', weight: 80, unit: 'kg' }
        ]
    },

    // =============================================
    // INITIALIZATION
    // =============================================
    init() {
        console.log('💪 LIFT initialized');
        this.loadFromStorage();
        this.renderAllExercises();
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Unit toggle buttons
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const unit = e.target.dataset.unit;
                this.switchUnit(unit);
            });
        });
    },

    // =============================================
    // RENDERING
    // =============================================
    renderAllExercises() {
        this.renderMuscleGroup('push', this.exercises.push);
        this.renderMuscleGroup('pull', this.exercises.pull);
        this.renderMuscleGroup('legs', this.exercises.legs);
    },

    renderMuscleGroup(groupId, exercises) {
        const container = document.getElementById(`${groupId}-exercises`);
        if (!container) return;

        container.innerHTML = exercises.map(exercise => this.renderExerciseCard(exercise)).join('');
        
        // Attach event listeners to the newly created buttons
        exercises.forEach(exercise => {
            this.attachExerciseListeners(exercise.id);
        });
    },

    renderExerciseCard(exercise) {
        const displayWeight = this.currentUnit === 'kg' ? exercise.weight : this.convertKgToLb(exercise.weight);
        const weightUnit = this.currentUnit;
        
        return `
            <div class="exercise-card" id="exercise-${exercise.id}">
                <div class="exercise-header">
                    <span class="exercise-name">${exercise.name}</span>
                    <span class="exercise-weight">${displayWeight} ${weightUnit}</span>
                </div>
                <div class="exercise-controls">
                    <button class="control-btn decrement" data-exercise="${exercise.id}" data-action="decrement">− ${this.currentUnit === 'kg' ? '2.5' : '5'}${this.currentUnit}</button>
                    <button class="control-btn increment" data-exercise="${exercise.id}" data-action="increment">+ ${this.currentUnit === 'kg' ? '2.5' : '5'}${this.currentUnit}</button>
                </div>
                <div class="reps-section">
                    <div class="reps-label">How many reps did you do?</div>
                    <div class="reps-buttons">
                        <button class="reps-btn" data-exercise="${exercise.id}" data-reps="2-4">2-4 reps</button>
                        <button class="reps-btn" data-exercise="${exercise.id}" data-reps="5-9">5-9 reps</button>
                        <button class="reps-btn" data-exercise="${exercise.id}" data-reps="10+">10+ reps</button>
                    </div>
                </div>
            </div>
        `;
    },

    attachExerciseListeners(exerciseId) {
        const exercise = this.findExerciseById(exerciseId);
        if (!exercise) return;

        // Weight control buttons
        const decrementBtn = document.querySelector(`[data-exercise="${exerciseId}"][data-action="decrement"]`);
        const incrementBtn = document.querySelector(`[data-exercise="${exerciseId}"][data-action="increment"]`);

        if (decrementBtn) {
            decrementBtn.addEventListener('click', () => this.adjustWeight(exerciseId, 'decrement'));
        }

        if (incrementBtn) {
            incrementBtn.addEventListener('click', () => this.adjustWeight(exerciseId, 'increment'));
        }

        // Reps buttons
        document.querySelectorAll(`[data-exercise="${exerciseId}"][data-reps]`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reps = e.target.dataset.reps;
                this.handleRepsFeedback(exerciseId, reps);
            });
        });
    },

    // =============================================
    // WEIGHT ADJUSTMENT
    // =============================================
    adjustWeight(exerciseId, action) {
        const exercise = this.findExerciseById(exerciseId);
        if (!exercise) return;

        const increment = this.currentUnit === 'kg' ? 2.5 : 5;
        
        if (action === 'increment') {
            exercise.weight += increment;
        } else {
            exercise.weight = Math.max(0, exercise.weight - increment);
        }

        // Update display
        this.updateExerciseDisplay(exerciseId);
        
        // Save to localStorage
        this.saveToStorage();
    },

    // =============================================
    // REPS FEEDBACK
    // =============================================
    handleRepsFeedback(exerciseId, repsRange) {
        const exercise = this.findExerciseById(exerciseId);
        if (!exercise) return;

        let message = '';
        let icon = '💪';
        let title = '';

        switch(repsRange) {
            case '2-4':
                title = 'Too Heavy';
                message = `Lower the weight! ${this.currentUnit === 'kg' ? '2.5kg' : '5lb'} is too much for now. Try decreasing next time.`;
                icon = '🏋️‍♂️';
                break;
            case '5-9':
                title = 'Perfect Range';
                message = `Stay at this weight! You're in the ideal hypertrophy range. Focus on form.`;
                icon = '🎯';
                break;
            case '10+':
                title = 'Time to Progress';
                message = `Increase the weight! You're ready for ${this.currentUnit === 'kg' ? '2.5kg' : '5lb'} more. Great work!`;
                icon = '🚀';
                break;
        }

        this.showFeedback(title, message, icon);
    },

    // =============================================
    // UNIT CONVERSION
    // =============================================
    switchUnit(unit) {
        if (unit === this.currentUnit) return;

        // Update active button
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === unit);
        });

        // Convert all weights
        this.convertAllWeights(unit);
        
        // Update current unit
        this.currentUnit = unit;
        
        // Re-render displays
        this.updateAllDisplays();
    },

    convertAllWeights(targetUnit) {
        const convertFn = targetUnit === 'kg' 
            ? (weight) => this.convertLbToKg(weight)
            : (weight) => this.convertKgToLb(weight);

        // Convert each exercise
        ['push', 'pull', 'legs'].forEach(group => {
            this.exercises[group].forEach(exercise => {
                if (exercise.unit !== targetUnit) {
                    exercise.weight = convertFn(exercise.weight);
                    exercise.unit = targetUnit;
                }
            });
        });
    },

    convertKgToLb(kg) {
        return Math.round(kg * 2.20462);
    },

    convertLbToKg(lb) {
        return Math.round(lb / 2.20462);
    },

    // =============================================
    // UI UPDATES
    // =============================================
    updateAllDisplays() {
        ['push', 'pull', 'legs'].forEach(group => {
            this.exercises[group].forEach(exercise => {
                this.updateExerciseDisplay(exercise.id);
            });
        });
    },

    updateExerciseDisplay(exerciseId) {
        const exercise = this.findExerciseById(exerciseId);
        if (!exercise) return;

        const card = document.getElementById(`exercise-${exerciseId}`);
        if (!card) return;

        const weightSpan = card.querySelector('.exercise-weight');
        const displayWeight = this.currentUnit === 'kg' ? exercise.weight : this.convertKgToLb(exercise.weight);
        
        weightSpan.textContent = `${displayWeight} ${this.currentUnit}`;
        
        // Update button labels
        const decrementBtn = card.querySelector('[data-action="decrement"]');
        const incrementBtn = card.querySelector('[data-action="increment"]');
        
        if (decrementBtn) {
            decrementBtn.textContent = `− ${this.currentUnit === 'kg' ? '2.5' : '5'}${this.currentUnit}`;
        }
        
        if (incrementBtn) {
            incrementBtn.textContent = `+ ${this.currentUnit === 'kg' ? '2.5' : '5'}${this.currentUnit}`;
        }
    },

    // =============================================
    // FEEDBACK MODAL
    // =============================================
    showFeedback(title, message, icon = '💪') {
        const modal = document.getElementById('feedback-modal');
        const modalIcon = document.getElementById('modal-icon');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');

        modalIcon.textContent = icon;
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        modal.classList.add('active');
        
        // Auto close after 3 seconds
        setTimeout(() => {
            this.closeModal();
        }, 3000);
    },

    closeModal() {
        const modal = document.getElementById('feedback-modal');
        modal.classList.remove('active');
    },

    // =============================================
    // HELPER FUNCTIONS
    // =============================================
    findExerciseById(id) {
        for (const group of ['push', 'pull', 'legs']) {
            const exercise = this.exercises[group].find(ex => ex.id === id);
            if (exercise) return exercise;
        }
        return null;
    },

    // =============================================
    // STORAGE
    // =============================================
    saveToStorage() {
        const data = {
            exercises: this.exercises,
            currentUnit: this.currentUnit
        };
        localStorage.setItem('lift_data', JSON.stringify(data));
    },

    loadFromStorage() {
        const saved = localStorage.getItem('lift_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.exercises = data.exercises;
                this.currentUnit = data.currentUnit || 'kg';
                
                // Update unit toggle UI
                document.querySelectorAll('.unit-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.unit === this.currentUnit);
                });
            } catch (e) {
                console.error('Failed to load saved data');
            }
        }
    }
};

// =============================================
// INITIALIZE
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});