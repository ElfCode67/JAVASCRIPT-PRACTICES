// ==============================
// ENHANCED DATA STRUCTURES
// ==============================

// Enhanced array of todo objects with more properties
let todos = JSON.parse(localStorage.getItem('cafeTodos')) || [
    {
        id: 1,
        text: "Finish morning coffee",
        completed: true,
        timestamp: "09:00",
        category: "coffee",
        priority: 2,
        coffeeMatch: "Espresso",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        text: "Review project timeline",
        completed: false,
        timestamp: "10:30",
        category: "work",
        priority: 1,
        coffeeMatch: "Americano",
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 3,
        text: "Buy coffee beans",
        completed: false,
        timestamp: "14:00",
        category: "shopping",
        priority: 3,
        coffeeMatch: "French Press",
        createdAt: new Date().toISOString()
    }
];

// Coffee menu data array
const coffeeMenu = [
    { id: 1, name: "Espresso", icon: "fa-mug-hot", description: "Strong & quick", time: 5 },
    { id: 2, name: "Americano", icon: "fa-coffee", description: "Smooth & balanced", time: 7 },
    { id: 3, name: "Cappuccino", icon: "fa-mug-saucer", description: "Creamy delight", time: 10 },
    { id: 4, name: "Latte", icon: "fa-whiskey-glass", description: "Milky comfort", time: 12 },
    { id: 5, name: "Cold Brew", icon: "fa-glass-water", description: "Refreshing chill", time: 15 },
    { id: 6, name: "Mocha", icon: "fa-mug", description: "Chocolate treat", time: 8 }
];

// Timer sessions array
let timerSessions = JSON.parse(localStorage.getItem('timerSessions')) || [];

// Calculator history array
let calcHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];

// Statistics data
let stats = JSON.parse(localStorage.getItem('cafeStats')) || {
    coffeeBreaks: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalTime: 0,
    currentStreak: 1,
    lastActive: new Date().toDateString()
};

// ==============================
// DOM NAVIGATION & ELEMENT SELECTION
// ==============================

// Get elements using various DOM methods
const todoList = document.getElementById('todoList');
const timeDisplay = document.getElementById('timeDisplay');
const timerStatus = document.getElementById('timerStatus');
const sessionList = document.getElementById('sessionList');
const calcDisplay = document.getElementById('calcDisplay');
const historyList = document.getElementById('historyList');
const coffeeMenuGrid = document.getElementById('coffeeMenu');
const categoriesSummary = document.getElementById('categoriesSummary');

// Statistics elements
const totalTasksStat = document.querySelector('#totalTasksStat .stat-value');
const completedTasksStat = document.querySelector('#completedTasksStat .stat-value');
const coffeeCountStat = document.querySelector('#coffeeCountStat .stat-value');
const productivityScoreStat = document.querySelector('#productivityScoreStat .stat-value');

// Footer stats
const totalTimeTracked = document.getElementById('totalTimeTracked');
const currentStreak = document.getElementById('currentStreak');
const coffeeBreakCount = document.getElementById('coffeeBreakCount');

// ==============================
// CALCULATOR WITH HISTORY
// ==============================

let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetScreen = false;

const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const clearHistoryBtn = document.getElementById('clearHistory');

// Initialize calculator
updateDisplay();
renderCalcHistory();

// Event listeners with arrow functions
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        appendNumber(button.dataset.number);
        updateDisplay();
    });
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleOperation(button.dataset.action);
        updateDisplay();
    });
});

clearHistoryBtn.addEventListener('click', () => {
    calcHistory = [];
    saveCalcHistory();
    renderCalcHistory();
});

function appendNumber(number) {
    if (currentInput === '0' || shouldResetScreen) {
        currentInput = number;
        shouldResetScreen = false;
    } else {
        if (number === '.' && currentInput.includes('.')) return;
        currentInput += number;
    }
}

function handleOperation(op) {
    switch(op) {
        case 'clear':
            currentInput = '0';
            previousInput = '';
            operation = null;
            break;
            
        case 'backspace':
            currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
            break;
            
        case '=':
            if (operation === null || shouldResetScreen) return;
            compute();
            addToCalcHistory(`${previousInput} ${getOperationSymbol(operation)} ${currentInput} = ${currentInput}`);
            operation = null;
            previousInput = '';
            shouldResetScreen = true;
            break;
            
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
            if (operation !== null) compute();
            previousInput = currentInput;
            operation = op;
            shouldResetScreen = true;
            break;
    }
}

function compute() {
    let prev = parseFloat(previousInput);
    let current = parseFloat(currentInput);
    let result = 0;
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch(operation) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': result = prev / current; break;
        case '%': result = prev % current; break;
        default: return;
    }
    
    currentInput = result.toString().length > 10 ? result.toFixed(8) : result.toString();
}

function updateDisplay() {
    calcDisplay.textContent = currentInput;
}

function getOperationSymbol(op) {
    const symbols = {
        '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%'
    };
    return symbols[op] || op;
}

function addToCalcHistory(calculation) {
    calcHistory.unshift({
        id: Date.now(),
        calculation,
        timestamp: new Date().toLocaleTimeString()
    });
    
    if (calcHistory.length > 10) calcHistory.pop();
    saveCalcHistory();
    renderCalcHistory();
}

function renderCalcHistory() {
    historyList.innerHTML = calcHistory.map(item => `
        <li>
            <span>${item.calculation}</span>
            <small>${item.timestamp}</small>
        </li>
    `).join('') || '<li>No history yet</li>';
}

function saveCalcHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
}

// ==============================
// ENHANCED TIMER WITH SESSIONS
// ==============================

let timerInterval = null;
let timeLeft = 25 * 60;
let isRunning = false;
let currentSession = null;

const startBtn = document.getElementById('startTimer');
const pauseBtn = document.getElementById('pauseTimer');
const resetBtn = document.getElementById('resetTimer');
const presetButtons = document.querySelectorAll('.preset-btn');

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes);
        setTimer(minutes);
    });
});

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    timerStatus.textContent = "Brewing in progress... ☕";
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // Start new session
    currentSession = {
        startTime: new Date(),
        duration: timeLeft,
        type: getTimerType(timeLeft)
    };
    
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerComplete();
            return;
        }
        
        timeLeft--;
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(timerInterval);
    timerStatus.textContent = "Paused - grab a refill";
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    timerStatus.textContent = "Ready to brew...";
    startBtn.disabled = false;
    pauseBtn.disabled = false;
    
    if (currentSession) {
        currentSession.endTime = new Date();
        currentSession.completed = false;
        addTimerSession(currentSession);
        currentSession = null;
    }
}

function setTimer(minutes) {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = minutes * 60;
    updateTimerDisplay();
    timerStatus.textContent = `Set to ${minutes} minutes`;
    startBtn.disabled = false;
    pauseBtn.disabled = false;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function timerComplete() {
    isRunning = false;
    timerStatus.textContent = "Time's up! Coffee break? ☕";
    timeDisplay.style.color = '#e53935';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Complete session
    if (currentSession) {
        currentSession.endTime = new Date();
        currentSession.completed = true;
        addTimerSession(currentSession);
        currentSession = null;
        
        // Update stats
        const duration = timeLeft;
        stats.totalTime += duration;
        updateStats();
    }
    
    setTimeout(() => {
        timeDisplay.style.color = '#5d4037';
    }, 3000);
}

function getTimerType(duration) {
    const minutes = duration / 60;
    if (minutes <= 5) return 'quick';
    if (minutes <= 25) return 'focus';
    if (minutes <= 45) return 'deep';
    return 'long';
}

function addTimerSession(session) {
    timerSessions.unshift({
        ...session,
        id: Date.now(),
        formattedDuration: formatDuration(session.duration)
    });
    
    if (timerSessions.length > 10) timerSessions.pop();
    saveTimerSessions();
    renderTimerSessions();
}

function renderTimerSessions() {
    const today = new Date().toDateString();
    const todaySessions = timerSessions.filter(session => 
        new Date(session.startTime).toDateString() === today
    );
    
    sessionList.innerHTML = todaySessions.map(session => `
        <div class="session-item">
            <span>${session.type.charAt(0).toUpperCase() + session.type.slice(1)}</span>
            <span>${session.formattedDuration}</span>
            <span>${session.completed ? '✅' : '⏸️'}</span>
        </div>
    `).join('') || '<div class="session-item">No sessions today</div>';
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function saveTimerSessions() {
    localStorage.setItem('timerSessions', JSON.stringify(timerSessions));
}

// ==============================
// ENHANCED TO-DO LIST WITH ARRAY METHODS
// ==============================

let currentFilter = 'all';
let currentSort = 'newest';

const todoInput = document.getElementById('todoInput');
const todoCategory = document.getElementById('todoCategory');
const addTodoBtn = document.getElementById('addTodoBtn');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const markAllCompleteBtn = document.getElementById('markAllComplete');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortTodos');

// Initialize
renderTodos();
updateCategoriesSummary();

// Event listeners
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

clearCompletedBtn.addEventListener('click', clearCompletedTodos);
markAllCompleteBtn.addEventListener('click', markAllComplete);

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTodos();
});

// CREATE
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        category: todoCategory.value,
        priority: getPriorityForCategory(todoCategory.value),
        coffeeMatch: getCoffeeForCategory(todoCategory.value),
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateStats();
    updateCategoriesSummary();
    
    todoInput.value = '';
    todoInput.focus();
}

// READ & RENDER using array methods
function renderTodos() {
    // Filter todos
    const filteredTodos = todos.filter(todo => {
        switch(currentFilter) {
            case 'active': return !todo.completed;
            case 'completed': return todo.completed;
            case 'coffee': return todo.category === 'coffee';
            default: return true;
        }
    });
    
    // Sort todos using array sort method
    const sortedTodos = [...filteredTodos].sort((a, b) => {
        switch(currentSort) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'priority':
                return a.priority - b.priority;
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });
    
    // Use array map method to generate HTML
    if (sortedTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <p>No tasks here. Time for a coffee break! ☕</p>
            </div>
        `;
    } else {
        todoList.innerHTML = sortedTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <span class="todo-category">${todo.category}</span>
                <small class="todo-time">${todo.timestamp}</small>
                <div class="todo-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `).join('');
        
        // Add event listeners using forEach
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTodo);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editTodo);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTodo);
        });
    }
    
    updateTaskCount();
}

// UPDATE - Toggle completion
function toggleTodo(e) {
    const id = parseInt(e.target.closest('.todo-item').dataset.id);
    const todo = todos.find(t => t.id === id);
    
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
        updateCategoriesSummary();
    }
}

// UPDATE - Edit task
function editTodo(e) {
    const item = e.target.closest('.todo-item');
    const id = parseInt(item.dataset.id);
    const todo = todos.find(t => t.id === id);
    
    if (!todo) return;
    
    const newText = prompt('Edit your task:', todo.text);
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
        saveTodos();
        renderTodos();
    }
}

// DELETE
function deleteTodo(e) {
    const id = parseInt(e.target.closest('.todo-item').dataset.id);
    
    if (confirm('Remove this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
        updateCategoriesSummary();
    }
}

// Helper functions using array methods
function clearCompletedTodos() {
    if (!confirm('Clear all completed tasks?')) return;
    
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateStats();
    updateCategoriesSummary();
}

function markAllComplete() {
    todos.forEach(todo => todo.completed = true);
    saveTodos();
    renderTodos();
    updateStats();
}

function updateTaskCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    const totalCount = todos.length;
    taskCount.textContent = `${activeCount} active of ${totalCount} total`;
}

function updateCategoriesSummary() {
    // Use array reduce method to count categories
    const categoryCounts = todos.reduce((acc, todo) => {
        acc[todo.category] = (acc[todo.category] || 0) + 1;
        return acc;
    }, {});
    
    // Generate summary using map method
    categoriesSummary.innerHTML = Object.entries(categoryCounts)
        .map(([category, count]) => `
            <div class="category-badge category-${category}">
                <i class="fas fa-${getCategoryIcon(category)}"></i>
                ${category}: ${count}
            </div>
        `).join('');
}

function getCategoryIcon(category) {
    const icons = {
        work: 'briefcase',
        personal: 'user',
        coffee: 'mug-hot',
        shopping: 'shopping-cart'
    };
    return icons[category] || 'circle';
}

function getPriorityForCategory(category) {
    const priorities = {
        work: 1,
        personal: 2,
        coffee: 3,
        shopping: 2
    };
    return priorities[category] || 2;
}

function getCoffeeForCategory(category) {
    const coffees = {
        work: 'Americano',
        personal: 'Latte',
        coffee: 'Espresso',
        shopping: 'Cold Brew'
    };
    return coffees[category] || 'Coffee';
}

function saveTodos() {
    localStorage.setItem('cafeTodos', JSON.stringify(todos));
}

// ==============================
// COFFEE MENU
// ==============================

const addCoffeeBreakBtn = document.getElementById('addCoffeeBreak');

// Render coffee menu using array map method
coffeeMenuGrid.innerHTML = coffeeMenu.map(coffee => `
    <div class="coffee-item" data-time="${coffee.time}">
        <i class="fas ${coffee.icon}"></i>
        <h4>${coffee.name}</h4>
        <p>${coffee.description}</p>
        <small>${coffee.time} min</small>
    </div>
`).join('');

// Add event listeners to coffee items
document.querySelectorAll('.coffee-item').forEach(item => {
    item.addEventListener('click', () => {
        const time = parseInt(item.dataset.time);
        setTimer(time);
        timerStatus.textContent = `Time for a ${item.querySelector('h4').textContent}!`;
    });
});

// Coffee break counter
addCoffeeBreakBtn.addEventListener('click', () => {
    stats.coffeeBreaks++;
    saveStats();
    updateStats();
    
    // Add a coffee break task
    const coffeeBreakTodo = {
        id: Date.now(),
        text: "Coffee break ☕",
        completed: false,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        category: "coffee",
        priority: 3,
        coffeeMatch: "Any",
        createdAt: new Date().toISOString()
    };
    
    todos.push(coffeeBreakTodo);
    saveTodos();
    renderTodos();
    updateCategoriesSummary();
});

// ==============================
// STATISTICS
// ==============================

function updateStats() {
    // Calculate statistics using array methods
    stats.totalTasks = todos.length;
    stats.completedTasks = todos.filter(todo => todo.completed).length;
    
    const productivity = stats.totalTasks > 0 ? 
        Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
    
    // Check streak
    const today = new Date().toDateString();
    if (stats.lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (stats.lastActive === yesterday.toDateString()) {
            stats.currentStreak++;
        } else {
            stats.currentStreak = 1;
        }
        
        stats.lastActive = today;
        saveStats();
    }
    
    // Update DOM elements
    totalTasksStat.textContent = stats.totalTasks;
    completedTasksStat.textContent = stats.completedTasks;
    coffeeCountStat.textContent = stats.coffeeBreaks;
    productivityScoreStat.textContent = `${productivity}%`;
    
    totalTimeTracked.textContent = `Total time tracked: ${Math.round(stats.totalTime / 60)} min`;
    currentStreak.textContent = `Current streak: ${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`;
    coffeeBreakCount.textContent = `Today: ${stats.coffeeBreaks} coffee break${stats.coffeeBreaks !== 1 ? 's' : ''}`;
}

function saveStats() {
    localStorage.setItem('cafeStats', JSON.stringify(stats));
}

// ==============================
// INITIALIZATION & EVENT LISTENERS
// ==============================

function initializeApp() {
    // Initialize all components
    updateTimerDisplay();
    renderTodos();
    renderTimerSessions();
    updateStats();
    
    // Add global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to toggle timer (only when not in input)
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (isRunning) pauseTimer();
            else startTimer();
        }
        
        // Escape to clear calculator
        if (e.key === 'Escape' && !e.target.matches('input')) {
            handleOperation('clear');
            updateDisplay();
        }
        
        // Ctrl+Enter to add todo
        if (e.ctrlKey && e.key === 'Enter' && document.activeElement === todoInput) {
            addTodo();
        }
    });
    
    // Mouse events for better UX
    document.querySelectorAll('.panel').forEach(panel => {
        panel.addEventListener('mouseenter', () => {
            panel.style.boxShadow = '0 8px 25px rgba(93, 64, 55, 0.2)';
        });
        
        panel.addEventListener('mouseleave', () => {
            panel.style.boxShadow = '0 5px 15px rgba(141, 110, 99, 0.1)';
        });
    });
    
    console.log('☕ Café Productivity Station Enhanced loaded successfully!');
}

// Start the application
window.addEventListener('load', initializeApp);