/**
 * LIFT - Enhanced Version
 * More interactive and user-friendly
 */

const app = {
    // =============================================
    // STATE
    // =============================================
    currentUnit: 'kg',
    
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
        console.log('💪 LIFT enhanced version initialized');
        this.loadFromStorage();
        this.renderAllExercises();
        this.setupEventListeners();
    },

    setupEventListeners() {
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
        
        exercises.forEach(exercise => {
            this.attachExerciseListeners(exercise.id);
        });
    },

    renderExerciseCard(exercise) {
        const displayWeight = this.currentUnit === 'kg' ? exercise.weight : this.convertKgToLb(exercise.weight);
        const weightUnit = this.currentUnit;
        const increment = this.currentUnit === 'kg' ? '2.5' : '5';
        
        return `
            <div class="exercise-card" id="exercise-${exercise.id}">
                <div class="exercise-header">
                    <span class="exercise-name">${exercise.name}</span>
                    <span class="exercise-weight weight-display" id="weight-${exercise.id}">${displayWeight} ${weightUnit}</span>
                </div>
                <div class="exercise-controls">
                    <button class="control-btn decrement" data-exercise="${exercise.id}" data-action="decrement">
                        − ${increment}${weightUnit} <span>⬇️</span>
                    </button>
                    <button class="control-btn increment" data-exercise="${exercise.id}" data-action="increment">
                        + ${increment}${weightUnit} <span>⬆️</span>
                    </button>
                </div>
                <div class="reps-section">
                    <div class="reps-label">How many reps did you complete?</div>
                    <div class="reps-buttons">
                        <button class="reps-btn" data-exercise="${exercise.id}" data-reps="2-4">
                            <span class="reps-range">2-4</span>
                            <span class="reps-desc">too heavy</span>
                        </button>
                        <button class="reps-btn" data-exercise="${exercise.id}" data-reps="5-9">
                            <span class="reps-range">5-9</span>
                            <span class="reps-desc">perfect</span>
                        </button>
                        <button class="reps-btn" data-exercise="${exercise.id}" data-reps="10+">
                            <span class="reps-range">10+</span>
                            <span class="reps-desc">increase</span>
                        </button>
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
                
                // Add visual feedback to button
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
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
            this.showWeightFeedback(exerciseId, 'up');
        } else {
            exercise.weight = Math.max(0, exercise.weight - increment);
            this.showWeightFeedback(exerciseId, 'down');
        }

        // Update display with animation
        this.updateExerciseDisplay(exerciseId, true);
        
        // Save to localStorage
        this.saveToStorage();
    },

    showWeightFeedback(exerciseId, direction) {
        const weightElement = document.getElementById(`weight-${exerciseId}`);
        if (!weightElement) return;

        weightElement.classList.add('weight-update');
        
        // Add color feedback
        if (direction === 'up') {
            weightElement.style.color = 'var(--success)';
        } else {
            weightElement.style.color = 'var(--danger)';
        }

        setTimeout(() => {
            weightElement.classList.remove('weight-update');
            weightElement.style.color = '';
        }, 300);
    },

    // =============================================
    // REPS FEEDBACK
    // =============================================
    handleRepsFeedback(exerciseId, repsRange) {
        const exercise = this.findExerciseById(exerciseId);
        if (!exercise) return;

        let message = '';
        let icon = '';
        let title = '';

        switch(repsRange) {
            case '2-4':
                title = '⬇️ TOO HEAVY';
                message = `Decrease the weight! ${this.currentUnit === 'kg' ? '2.5kg' : '5lb'} is too much for now. Focus on form with lighter weight.`;
                icon = '🏋️';
                break;
            case '5-9':
                title = '🎯 PERFECT RANGE';
                message = `Stay at this weight! You're in the ideal range for muscle growth. Keep up the great form!`;
                icon = '💪';
                break;
            case '10+':
                title = '🚀 TIME TO PROGRESS';
                message = `Increase the weight! You're ready for ${this.currentUnit === 'kg' ? '2.5kg' : '5lb'} more. Great work pushing yourself!`;
                icon = '⚡';
                break;
        }

        this.showFeedback(title, message, icon);
    },

    // =============================================
    // UNIT CONVERSION
    // =============================================
    switchUnit(unit) {
        if (unit === this.currentUnit) return;

        // Update active button with animation
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === unit);
            
            if (btn.dataset.unit === unit) {
                btn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            }
        });

        // Convert all weights
        this.convertAllWeights(unit);
        
        // Update current unit
        this.currentUnit = unit;
        
        // Re-render displays with animation
        this.updateAllDisplays();
    },

    convertAllWeights(targetUnit) {
        const convertFn = targetUnit === 'kg' 
            ? (weight) => this.convertLbToKg(weight)
            : (weight) => this.convertKgToLb(weight);

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
                this.updateExerciseDisplay(exercise.id, false);
            });
        });
    },

    updateExerciseDisplay(exerciseId, animate = false) {
        const exercise = this.findExerciseById(exerciseId);
        if (!exercise) return;

        const weightElement = document.getElementById(`weight-${exerciseId}`);
        if (!weightElement) return;

        const displayWeight = this.currentUnit === 'kg' ? exercise.weight : this.convertKgToLb(exercise.weight);
        
        if (animate) {
            weightElement.classList.add('weight-update');
            setTimeout(() => {
                weightElement.classList.remove('weight-update');
            }, 300);
        }
        
        weightElement.textContent = `${displayWeight} ${this.currentUnit}`;
        
        // Update button labels
        const card = document.getElementById(`exercise-${exerciseId}`);
        if (card) {
            const decrementBtn = card.querySelector('[data-action="decrement"]');
            const incrementBtn = card.querySelector('[data-action="increment"]');
            const increment = this.currentUnit === 'kg' ? '2.5' : '5';
            
            if (decrementBtn) {
                decrementBtn.innerHTML = `− ${increment}${this.currentUnit} <span>⬇️</span>`;
            }
            
            if (incrementBtn) {
                incrementBtn.innerHTML = `+ ${increment}${this.currentUnit} <span>⬆️</span>`;
            }
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
        
        // Auto close after 4 seconds
        setTimeout(() => {
            this.closeModal();
        }, 4000);
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