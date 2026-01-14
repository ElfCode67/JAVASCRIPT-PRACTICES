// ==============================
// CALCULATOR FUNCTIONALITY
// ==============================

let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetScreen = false;

const display = document.getElementById('calcDisplay');
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');

// Initialize calculator
updateDisplay();

// Number button click handlers
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        appendNumber(button.dataset.number);
        updateDisplay();
    });
});

// Operator button click handlers
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleOperation(button.dataset.action);
        updateDisplay();
    });
});

function appendNumber(number) {
    if (currentInput === '0' || shouldResetScreen) {
        currentInput = number;
        shouldResetScreen = false;
    } else {
        // Prevent multiple decimal points
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
    
    // Handle decimal precision
    currentInput = result.toString().length > 10 ? result.toFixed(8) : result.toString();
}

function updateDisplay() {
    display.textContent = currentInput;
}

// ==============================
// TIMER FUNCTIONALITY
// ==============================

let timerInterval = null;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;

const timeDisplay = document.getElementById('timeDisplay');
const timerStatus = document.getElementById('timerStatus');
const startBtn = document.getElementById('startTimer');
const pauseBtn = document.getElementById('pauseTimer');
const resetBtn = document.getElementById('resetTimer');
const presetButtons = document.querySelectorAll('.preset-btn');

// Timer controls
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Preset buttons
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
    
    // Play a sound if you add one
    // new Audio('notification.mp3').play();
    
    // Reset color after 3 seconds
    setTimeout(() => {
        timeDisplay.style.color = '#5d4037';
    }, 3000);
}

// Initialize timer display
updateTimerDisplay();

// ==============================
// TO-DO LIST FUNCTIONALITY
// ==============================

let todos = JSON.parse(localStorage.getItem('cafeTodos')) || [];
let currentFilter = 'all';

const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize todo list
renderTodos();

// Event listeners
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

clearCompletedBtn.addEventListener('click', clearCompletedTodos);

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// CRUD Operations

// CREATE
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    
    todoInput.value = '';
    todoInput.focus();
}

// READ & RENDER
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <p>No tasks here. Time for a coffee break! ☕</p>
            </div>
        `;
    } else {
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <small class="todo-time">${todo.timestamp}</small>
                <div class="todo-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `).join('');
        
        // Add event listeners to the new elements
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
    }
}

function clearCompletedTodos() {
    if (!confirm('Clear all completed tasks?')) return;
    
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

// Helper functions
function getFilteredTodos() {
    switch(currentFilter) {
        case 'active': return todos.filter(todo => !todo.completed);
        case 'completed': return todos.filter(todo => todo.completed);
        default: return todos;
    }
}

function updateTaskCount() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    const totalCount = todos.length;
    taskCount.textContent = `${activeCount} active of ${totalCount} total`;
}

function saveTodos() {
    localStorage.setItem('cafeTodos', JSON.stringify(todos));
}

// ==============================
// ADDITIONAL FEATURES
// ==============================

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter to add todo
    if (e.ctrlKey && e.key === 'Enter') {
        addTodo();
    }
    
    // Space to toggle timer
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (isRunning) pauseTimer();
        else startTimer();
    }
    
    // Escape to clear calculator
    if (e.key === 'Escape') {
        handleOperation('clear');
        updateDisplay();
    }
});

// Initialize all components on load
window.addEventListener('load', () => {
    updateTimerDisplay();
    renderTodos();
    console.log('☕ Café Productivity Station loaded successfully!');
});