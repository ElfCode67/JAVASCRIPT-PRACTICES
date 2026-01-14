// ==============================
// DATA STRUCTURE & STATE MANAGEMENT
// ==============================

// State management using multiple arrays by category
let habits = {
    health: [],
    learning: [],
    productivity: [],
    mindfulness: [],
    fitness: [],
    creative: []
};

let currentFilter = 'all';
let currentTheme = localStorage.getItem('theme') || 'light';

// Pre-populated example habits
const exampleHabits = [
    {
        id: 1,
        name: "Morning Meditation",
        category: "mindfulness",
        color: "#ffb8c6",
        bestTime: "morning",
        frequency: "daily",
        target: 1,
        current: 0,
        streak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        totalAttempts: 0,
        history: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: "Drink 8 glasses of water",
        category: "health",
        color: "#b8e1dd",
        bestTime: "anytime",
        frequency: "daily",
        target: 8,
        current: 0,
        streak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        totalAttempts: 0,
        history: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        name: "30 min Exercise",
        category: "fitness",
        color: "#ffd8b8",
        bestTime: "evening",
        frequency: "daily",
        target: 1,
        current: 0,
        streak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        totalAttempts: 0,
        history: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        name: "Read 20 pages",
        category: "learning",
        color: "#d6c6ff",
        bestTime: "afternoon",
        frequency: "daily",
        target: 1,
        current: 0,
        streak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        totalAttempts: 0,
        history: [],
        createdAt: new Date().toISOString()
    },
    {
        id: 5,
        name: "Plan next day",
        category: "productivity",
        color: "#e6c6ff",
        bestTime: "evening",
        frequency: "daily",
        target: 1,
        current: 0,
        streak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        totalAttempts: 0,
        history: [],
        createdAt: new Date().toISOString()
    }
];

// Daily motivational quotes
const quotes = [
    { text: "Small daily improvements lead to stunning results.", author: "Your future self" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "It's not about perfect. It's about effort.", author: "Jillian Michaels" },
    { text: "Every flower must grow through dirt.", author: "Anonymous" },
    { text: "Your only limit is your mind.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" }
];

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Set theme
    setTheme(currentTheme);
    
    // Load habits from localStorage or initialize with examples
    loadHabits();
    
    // Initialize UI components
    initializeDate();
    initializeQuote();
    initializeEventListeners();
    updateDashboard();
    renderCalendar();
    
    console.log("🌸 Blooming Habits Tracker initialized!");
}

function loadHabits() {
    const savedHabits = localStorage.getItem('bloomingHabits');
    
    if (savedHabits) {
        const parsed = JSON.parse(savedHabits);
        if (parsed && typeof parsed === 'object') {
            habits = parsed;
        }
    } else {
        // Initialize with example habits
        exampleHabits.forEach(habit => {
            habits[habit.category].push(habit);
        });
        saveHabits();
    }
    
    // Initialize today's tracking
    initializeTodayTracking();
}

function initializeTodayTracking() {
    const today = getTodayDateString();
    
    for (const category in habits) {
        habits[category].forEach(habit => {
            // Check if habit has been tracked today
            const todayEntry = habit.history.find(entry => entry.date === today);
            if (todayEntry) {
                habit.current = todayEntry.completed;
            } else {
                // Add new entry for today
                habit.history.push({
                    date: today,
                    completed: 0,
                    timeOfDay: null
                });
                habit.current = 0;
            }
        });
    }
    saveHabits();
}

function saveHabits() {
    localStorage.setItem('bloomingHabits', JSON.stringify(habits));
}

// ==============================
// THEME MANAGEMENT
// ==============================

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const toggleBtn = document.getElementById('themeToggle');
    if (theme === 'dark') {
        toggleBtn.style.background = 'linear-gradient(135deg, #3a4d46, #2a3d36)';
    } else {
        toggleBtn.style.background = 'linear-gradient(135deg, var(--accent-mint), var(--accent-lavender))';
    }
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// ==============================
// DATE & QUOTE MANAGEMENT
// ==============================

function initializeDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

function initializeQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const quoteIndex = dayOfYear % quotes.length;
    
    const quote = quotes[quoteIndex];
    document.getElementById('dailyQuote').innerHTML = `
        <p>"${quote.text}"</p>
        <small>– ${quote.author}</small>
    `;
}

function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ==============================
// HABIT CRUD OPERATIONS
// ==============================

// CREATE
document.getElementById('addHabitForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('habitName').value.trim();
    const category = document.getElementById('habitCategory').value;
    const bestTime = document.querySelector('input[name="bestTime"]:checked').value;
    const frequency = document.getElementById('habitFrequency').value;
    
    if (!name) return;
    
    const newHabit = {
        id: Date.now(),
        name: name,
        category: category,
        color: getCategoryColor(category),
        bestTime: bestTime,
        frequency: frequency,
        target: frequency === 'daily' ? 1 : (frequency === 'weekly' ? 3 : 5),
        current: 0,
        streak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        totalAttempts: 0,
        history: [{
            date: getTodayDateString(),
            completed: 0,
            timeOfDay: null
        }],
        createdAt: new Date().toISOString()
    };
    
    habits[category].push(newHabit);
    saveHabits();
    updateDashboard();
    
    // Reset form
    this.reset();
    document.getElementById('habitCategory').value = 'health';
    document.querySelector('input[name="bestTime"][value="morning"]').checked = true;
    document.getElementById('habitFrequency').value = 'daily';
    
    // Show feedback
    showNotification(`"${name}" planted in your garden! 🌱`);
});

// READ & RENDER
function renderHabits() {
    const container = document.getElementById('habitsContainer');
    const filteredHabits = getFilteredHabits();
    
    if (filteredHabits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Your garden is empty. Plant some habits to watch them bloom! 🌸</p>
                <p><small>Try filtering differently or add new habits.</small></p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredHabits.map(habit => `
        <div class="habit-card ${habit.category}" data-id="${habit.id}">
            <div class="habit-header">
                <div class="habit-title">
                    <input type="checkbox" class="habit-checkbox" 
                           ${habit.current >= habit.target ? 'checked' : ''}
                           data-id="${habit.id}">
                    <span class="habit-name">${habit.name}</span>
                </div>
                <div class="habit-meta">
                    <span class="habit-category">${getCategoryEmoji(habit.category)} ${getCategoryName(habit.category)}</span>
                    <span class="habit-time">${getTimeEmoji(habit.bestTime)} ${habit.bestTime}</span>
                </div>
                <div class="habit-actions">
                    <button class="habit-btn edit-btn" data-id="${habit.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="habit-btn delete-btn" data-id="${habit.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(habit.current / habit.target) * 100}%"></div>
            </div>
            
            <div class="habit-stats">
                <div class="stat">
                    <span class="stat-value">${habit.streak}</span>
                    <span class="stat-label">Day Streak</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${habit.bestStreak}</span>
                    <span class="stat-label">Best Streak</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${calculateSuccessRate(habit)}%</span>
                    <span class="stat-label">Success Rate</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to the new elements
    document.querySelectorAll('.habit-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', toggleHabitCompletion);
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', editHabit);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteHabit);
    });
}

// UPDATE - Toggle completion
function toggleHabitCompletion(e) {
    const habitId = parseInt(e.target.dataset.id);
    const habit = findHabitById(habitId);
    
    if (!habit) return;
    
    const today = getTodayDateString();
    const todayEntry = habit.history.find(entry => entry.date === today);
    
    if (habit.current >= habit.target) {
        // Untoggle
        habit.current = 0;
        if (todayEntry) {
            todayEntry.completed = 0;
            todayEntry.timeOfDay = null;
        }
        // Reset streak if it was completed today
        const yesterday = getYesterdayDateString();
        const yesterdayEntry = habit.history.find(entry => entry.date === yesterday);
        if (!yesterdayEntry || yesterdayEntry.completed < habit.target) {
            habit.streak = 0;
        }
    } else {
        // Toggle complete
        habit.current = habit.target;
        if (todayEntry) {
            todayEntry.completed = habit.target;
            todayEntry.timeOfDay = getCurrentTimeOfDay();
        }
        habit.totalCompleted += habit.target;
        habit.totalAttempts++;
        
        // Update streak
        const yesterday = getYesterdayDateString();
        const yesterdayEntry = habit.history.find(entry => entry.date === yesterday);
        
        if (yesterdayEntry && yesterdayEntry.completed >= habit.target) {
            habit.streak++;
        } else {
            habit.streak = 1;
        }
        
        if (habit.streak > habit.bestStreak) {
            habit.bestStreak = habit.streak;
        }
    }
    
    saveHabits();
    updateDashboard();
    
    // Check for perfect day achievement
    checkAchievements();
}

// UPDATE - Edit habit
function editHabit(e) {
    const habitId = parseInt(e.target.closest('.edit-btn').dataset.id);
    const habit = findHabitById(habitId);
    
    if (!habit) return;
    
    const newName = prompt('Edit habit name:', habit.name);
    if (newName !== null && newName.trim() !== '') {
        habit.name = newName.trim();
        saveHabits();
        updateDashboard();
        showNotification('Habit updated! ✨');
    }
}

// DELETE
function deleteHabit(e) {
    const habitId = parseInt(e.target.closest('.delete-btn').dataset.id);
    
    if (confirm('Remove this habit from your garden?')) {
        for (const category in habits) {
            habits[category] = habits[category].filter(h => h.id !== habitId);
        }
        saveHabits();
        updateDashboard();
        showNotification('Habit removed 🌿');
    }
}

// ==============================
// DASHBOARD UPDATES
// ==============================

function updateDashboard() {
    renderHabits();
    updateStats();
    updateTimeAnalytics();
    updateStreaksList();
    updateCalendar();
}

function updateStats() {
    const allHabits = getAllHabits();
    const today = getTodayDateString();
    
    // Current streak (longest active streak)
    let currentStreak = 0;
    allHabits.forEach(habit => {
        if (habit.streak > currentStreak) {
            currentStreak = habit.streak;
        }
    });
    document.getElementById('currentStreak').textContent = `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`;
    
    // Today's progress
    const completedToday = allHabits.reduce((sum, habit) => sum + (habit.current >= habit.target ? 1 : 0), 0);
    const totalToday = allHabits.length;
    const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
    document.getElementById('todayProgress').textContent = `${progressPercent}%`;
    document.getElementById('completionRate').textContent = `${progressPercent}%`;
    
    // Active habits
    document.getElementById('activeHabits').textContent = totalToday;
    
    // Best streak
    let bestStreak = 0;
    allHabits.forEach(habit => {
        if (habit.bestStreak > bestStreak) {
            bestStreak = habit.bestStreak;
        }
    });
    document.getElementById('bestStreak').textContent = `${bestStreak} day${bestStreak !== 1 ? 's' : ''}`;
}

function updateTimeAnalytics() {
    const allHabits = getAllHabits();
    const today = getTodayDateString();
    
    let morningSuccess = 0;
    let morningTotal = 0;
    let eveningSuccess = 0;
    let eveningTotal = 0;
    
    allHabits.forEach(habit => {
        const todayEntry = habit.history.find(entry => entry.date === today);
        if (todayEntry) {
            if (habit.bestTime === 'morning' || habit.bestTime === 'anytime') {
                morningTotal++;
                if (todayEntry.completed >= habit.target && todayEntry.timeOfDay === 'morning') {
                    morningSuccess++;
                }
            }
            if (habit.bestTime === 'evening' || habit.bestTime === 'anytime') {
                eveningTotal++;
                if (todayEntry.completed >= habit.target && todayEntry.timeOfDay === 'evening') {
                    eveningSuccess++;
                }
            }
        }
    });
    
    const morningRate = morningTotal > 0 ? Math.round((morningSuccess / morningTotal) * 100) : 0;
    const eveningRate = eveningTotal > 0 ? Math.round((eveningSuccess / eveningTotal) * 100) : 0;
    
    document.getElementById('morningSuccess').style.width = `${morningRate}%`;
    document.getElementById('morningValue').textContent = `${morningRate}%`;
    document.getElementById('eveningSuccess').style.width = `${eveningRate}%`;
    document.getElementById('eveningValue').textContent = `${eveningRate}%`;
    
    // Week comparison (simplified)
    const thisWeekRate = 75; // Would calculate from history
    const lastWeekRate = 68; // Would calculate from history
    
    document.getElementById('thisWeek').textContent = `${thisWeekRate}%`;
    document.getElementById('lastWeek').textContent = `${lastWeekRate}%`;
    
    let arrow = '→';
    if (thisWeekRate > lastWeekRate) arrow = '↗';
    else if (thisWeekRate < lastWeekRate) arrow = '↘';
    
    document.getElementById('weekComparison').textContent = arrow;
    document.getElementById('weekComparison').style.color = thisWeekRate > lastWeekRate ? '#4CAF50' : '#f44336';
}

function updateStreaksList() {
    const container = document.getElementById('streaksList');
    const allHabits = getAllHabits();
    
    // Get habits with active streaks
    const streakingHabits = allHabits
        .filter(habit => habit.streak >= 3)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 5);
    
    if (streakingHabits.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No active streaks yet. Keep going! 🌱</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = streakingHabits.map(habit => `
        <div class="streak-item">
            <span class="streak-name">${habit.name}</span>
            <span class="streak-days">${habit.streak} day${habit.streak !== 1 ? 's' : ''}</span>
        </div>
    `).join('');
}

// ==============================
// CALENDAR
// ==============================

function renderCalendar() {
    const container = document.getElementById('calendar');
    const today = new Date();
    const days = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push(date);
    }
    
    container.innerHTML = days.map(date => {
        const dateString = date.toISOString().split('T')[0];
        const dayOfMonth = date.getDate();
        const dayOfWeek = date.getDay();
        
        // Calculate completion for this day
        let completion = 0;
        let total = 0;
        
        for (const category in habits) {
            habits[category].forEach(habit => {
                const entry = habit.history.find(e => e.date === dateString);
                if (entry) {
                    total++;
                    if (entry.completed >= habit.target) {
                        completion++;
                    }
                }
            });
        }
        
        const completionRate = total > 0 ? Math.round((completion / total) * 100) : 0;
        const isToday = dateString === getTodayDateString();
        const isPerfect = completionRate === 100;
        
        return `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isPerfect ? 'day-perfect' : ''}" 
                 title="${date.toLocaleDateString()}: ${completionRate}% complete">
                <div class="day-date">${dayOfMonth}</div>
                <div class="day-completion">${completionRate}%</div>
            </div>
        `;
    }).join('');
}

// ==============================
// CONTROL FUNCTIONS
// ==============================

// Mark all complete
document.getElementById('markAllToday').addEventListener('click', () => {
    if (confirm('Mark all habits as complete for today?')) {
        const today = getTodayDateString();
        const allHabits = getAllHabits();
        
        allHabits.forEach(habit => {
            habit.current = habit.target;
            const todayEntry = habit.history.find(entry => entry.date === today);
            if (todayEntry) {
                todayEntry.completed = habit.target;
                todayEntry.timeOfDay = getCurrentTimeOfDay();
            }
            
            // Update streak
            const yesterday = getYesterdayDateString();
            const yesterdayEntry = habit.history.find(entry => entry.date === yesterday);
            
            if (yesterdayEntry && yesterdayEntry.completed >= habit.target) {
                habit.streak++;
            } else {
                habit.streak = 1;
            }
            
            if (habit.streak > habit.bestStreak) {
                habit.bestStreak = habit.streak;
            }
            
            habit.totalCompleted += habit.target;
            habit.totalAttempts++;
        });
        
        saveHabits();
        updateDashboard();
        showNotification('Amazing! All habits complete for today! 🌟');
    }
});

// Print report
document.getElementById('printReport').addEventListener('click', () => {
    const modal = document.getElementById('printModal');
    const content = document.getElementById('printContent');
    
    const allHabits = getAllHabits();
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    let html = `
        <h3>Blooming Habits Report - ${month}</h3>
        <div class="report-summary">
            <p><strong>Total Habits:</strong> ${allHabits.length}</p>
            <p><strong>Current Streak:</strong> ${document.getElementById('currentStreak').textContent}</p>
            <p><strong>Best Streak:</strong> ${document.getElementById('bestStreak').textContent}</p>
            <p><strong>Today's Progress:</strong> ${document.getElementById('todayProgress').textContent}</p>
        </div>
        
        <h4>Habit Details:</h4>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">Habit</th>
                    <th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);">Streak</th>
                    <th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);">Success Rate</th>
                    <th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);">Best Time</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    allHabits.forEach(habit => {
        html += `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid var(--border-color);">${habit.name}</td>
                <td style="text-align: center; padding: 8px; border-bottom: 1px solid var(--border-color);">${habit.streak} days</td>
                <td style="text-align: center; padding: 8px; border-bottom: 1px solid var(--border-color);">${calculateSuccessRate(habit)}%</td>
                <td style="text-align: center; padding: 8px; border-bottom: 1px solid var(--border-color);">${habit.bestTime}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        
        <div style="margin-top: 30px; padding: 20px; background: var(--bg-primary); border-radius: 12px;">
            <p><strong>Insights:</strong></p>
            <p>• Morning success rate: ${document.getElementById('morningValue').textContent}</p>
            <p>• Evening success rate: ${document.getElementById('eveningValue').textContent}</p>
            <p>• Generated on: ${today.toLocaleDateString()}</p>
        </div>
        
        <style>
            @media print {
                body * {
                    visibility: hidden;
                }
                #printModal, #printModal * {
                    visibility: visible;
                }
                #printModal {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
            }
        </style>
    `;
    
    content.innerHTML = html;
    modal.style.display = 'flex';
});

// Clear completed
document.getElementById('clearCompleted').addEventListener('click', () => {
    if (confirm('Clear all completed habits from today?')) {
        const today = getTodayDateString();
        
        for (const category in habits) {
            habits[category].forEach(habit => {
                const todayEntry = habit.history.find(entry => entry.date === today);
                if (todayEntry) {
                    todayEntry.completed = 0;
                    todayEntry.timeOfDay = null;
                }
                habit.current = 0;
            });
        }
        
        saveHabits();
        updateDashboard();
        showNotification('Today\'s progress cleared. Fresh start! 🌱');
    }
});

// Reset all
document.getElementById('resetHabits').addEventListener('click', () => {
    if (confirm('⚠️ This will reset ALL habits and history. Are you sure?')) {
        if (confirm('⚠️ Really sure? This cannot be undone!')) {
            habits = {
                health: [],
                learning: [],
                productivity: [],
                mindfulness: [],
                fitness: [],
                creative: []
            };
            
            // Re-add example habits
            exampleHabits.forEach(habit => {
                habits[habit.category].push({
                    ...habit,
                    history: [{
                        date: getTodayDateString(),
                        completed: 0,
                        timeOfDay: null
                    }]
                });
            });
            
            saveHabits();
            updateDashboard();
            showNotification('Garden reset. Fresh start with example habits! 🌷');
        }
    }
});

// Close print modal
document.getElementById('closePrint').addEventListener('click', () => {
    document.getElementById('printModal').style.display = 'none';
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderHabits();
    });
});

// ==============================
// HELPER FUNCTIONS
// ==============================

function initializeEventListeners() {
    // Already set up in initialization
}

function getFilteredHabits() {
    if (currentFilter === 'all') {
        return getAllHabits();
    }
    return habits[currentFilter] || [];
}

function getAllHabits() {
    let all = [];
    for (const category in habits) {
        all = all.concat(habits[category]);
    }
    return all;
}

function findHabitById(id) {
    for (const category in habits) {
        const habit = habits[category].find(h => h.id === id);
        if (habit) return habit;
    }
    return null;
}

function getCategoryColor(category) {
    const colors = {
        health: '#ffb8c6',
        learning: '#d6c6ff',
        productivity: '#b8e1dd',
        mindfulness: '#ffd8b8',
        fitness: '#e6c6ff',
        creative: '#ffd166'
    };
    return colors[category] || '#b8e1dd';
}

function getCategoryName(category) {
    const names = {
        health: 'Health',
        learning: 'Learning',
        productivity: 'Productivity',
        mindfulness: 'Mindfulness',
        fitness: 'Fitness',
        creative: 'Creative'
    };
    return names[category] || category;
}

function getCategoryEmoji(category) {
    const emojis = {
        health: '🌸',
        learning: '📚',
        productivity: '💼',
        mindfulness: '🧘',
        fitness: '🏃',
        creative: '🎨'
    };
    return emojis[category] || '✨';
}

function getTimeEmoji(time) {
    const emojis = {
        morning: '☀️',
        afternoon: '🌤️',
        evening: '🌙',
        anytime: '⏳'
    };
    return emojis[time] || '✨';
}

function getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

function getYesterdayDateString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

function calculateSuccessRate(habit) {
    if (habit.totalAttempts === 0) return 0;
    return Math.round((habit.totalCompleted / (habit.target * habit.totalAttempts)) * 100);
}

function checkAchievements() {
    const allHabits = getAllHabits();
    const completedToday = allHabits.filter(h => h.current >= h.target).length;
    const totalToday = allHabits.length;
    
    if (completedToday === totalToday && totalToday > 0) {
        showNotification('🎉 PERFECT DAY! All habits completed!', 5000);
    }
}

function showNotification(message, duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-mint);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        ">
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Add notification animations to style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    }
`;
document.head.appendChild(style);