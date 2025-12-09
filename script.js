// DOM Elements
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const storageUsageEl = document.getElementById('storageUsage');
const filterButtons = document.querySelectorAll('.filter-btn');

// LocalStorage Demo Elements
const demoKeyInput = document.getElementById('demoKey');
const demoValueInput = document.getElementById('demoValue');
const saveDemoBtn = document.getElementById('saveDemoBtn');
const getDemoBtn = document.getElementById('getDemoBtn');
const removeDemoBtn = document.getElementById('removeDemoBtn');
const demoOutput = document.getElementById('demoOutput');

// Initialize tasks array from localStorage or empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the application
function initApp() {
    renderTasks();
    updateStats();
    setupEventListeners();
    setupDemoEventListeners();
    showLocalStorageContent();
}

// Update statistics display
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const storageUsed = JSON.stringify(tasks).length;
    
    totalTasksEl.textContent = totalTasks;
    completedTasksEl.textContent = completedTasks;
    pendingTasksEl.textContent = pendingTasks;
    storageUsageEl.textContent = `${storageUsed} bytes`;
    
    // Show/hide empty state
    if (totalTasks === 0) {
        emptyState.style.display = 'block';
        taskList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        taskList.style.display = 'block';
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
    showLocalStorageContent();
}

// Filter tasks based on current filter
function getFilteredTasks() {
    switch(currentFilter) {
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'high':
            return tasks.filter(task => task.priority === 'high');
        default:
            return tasks;
    }
}

// Create task element
function createTaskElement(task, index) {
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
    
    const priorityClass = `task-priority priority-${task.priority}`;
    const priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    
    taskEl.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-text">${task.text}</div>
        <div class="${priorityClass}">${priorityText}</div>
        <div class="task-actions">
            <button class="task-btn complete-btn">
                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="task-btn delete-btn">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    // Add event listeners for the task elements
    const checkbox = taskEl.querySelector('.task-checkbox');
    const completeBtn = taskEl.querySelector('.complete-btn');
    const deleteBtn = taskEl.querySelector('.delete-btn');
    
    checkbox.addEventListener('change', () => {
        tasks[index].completed = checkbox.checked;
        saveTasks();
        renderTasks();
    });
    
    completeBtn.addEventListener('click', () => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    });
    
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }
    });
    
    return taskEl;
}

// Render tasks based on current filter
function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();
    
    filteredTasks.forEach((task, index) => {
        // Find the original index in the tasks array
        const originalIndex = tasks.findIndex(t => t.id === task.id);
        const taskEl = createTaskElement(task, originalIndex);
        taskList.appendChild(taskEl);
    });
    
    updateStats();
}

// Add new task
function addTask() {
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;
    
    if (text === '') {
        alert('Please enter a task description');
        taskInput.focus();
        return;
    }
    
    const newTask = {
        id: Date.now(), // Simple unique ID using timestamp
        text: text,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    // Reset input
    taskInput.value = '';
    taskInput.focus();
    
    // Show confirmation message
    showMessage('Task added successfully!', 'success');
}

// Clear completed tasks
function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
        showMessage('No completed tasks to clear.', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        showMessage(`Cleared ${completedCount} completed task(s).`, 'success');
    }
}

// Clear all tasks and localStorage
function clearStorage() {
    if (tasks.length === 0) {
        showMessage('No tasks to clear.', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to delete ALL tasks and clear localStorage? This action cannot be undone.')) {
        tasks = [];
        localStorage.removeItem('tasks');
        renderTasks();
        showMessage('All tasks cleared and localStorage emptied.', 'success');
    }
}

// Show message to user
function showMessage(text, type) {
    // Remove any existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    
    // Add styles for message
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
        message.style.backgroundColor = '#2ecc71';
    } else if (type === 'error') {
        message.style.backgroundColor = '#e74c3c';
    } else {
        message.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(message);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Setup event listeners for main functionality
function setupEventListeners() {
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    clearStorageBtn.addEventListener('click', clearStorage);
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Update current filter
            currentFilter = button.getAttribute('data-filter');
            // Re-render tasks with new filter
            renderTasks();
        });
    });
}

// LocalStorage Demo Functions
function setupDemoEventListeners() {
    saveDemoBtn.addEventListener('click', () => {
        const key = demoKeyInput.value.trim();
        const value = demoValueInput.value.trim();
        
        if (!key) {
            demoOutput.textContent = 'Error: Please enter a key';
            return;
        }
        
        localStorage.setItem(key, value);
        demoOutput.textContent = `Saved: "${key}" = "${value}"`;
        showLocalStorageContent();
        
        // Clear inputs
        demoKeyInput.value = '';
        demoValueInput.value = '';
    });
    
    getDemoBtn.addEventListener('click', () => {
        const key = demoKeyInput.value.trim();
        
        if (!key) {
            demoOutput.textContent = 'Error: Please enter a key';
            return;
        }
        
        const value = localStorage.getItem(key);
        
        if (value === null) {
            demoOutput.textContent = `Key "${key}" not found in localStorage`;
        } else {
            demoOutput.textContent = `Value for "${key}": "${value}"`;
        }
    });
    
    removeDemoBtn.addEventListener('click', () => {
        const key = demoKeyInput.value.trim();
        
        if (!key) {
            demoOutput.textContent = 'Error: Please enter a key';
            return;
        }
        
        if (localStorage.getItem(key) === null) {
            demoOutput.textContent = `Key "${key}" not found in localStorage`;
        } else {
            localStorage.removeItem(key);
            demoOutput.textContent = `Removed key "${key}" from localStorage`;
            showLocalStorageContent();
        }
    });
}

// Show all localStorage content
function showLocalStorageContent() {
    // This function is called to update the demo display
    // We'll update it when tasks are saved
    const taskStorage = localStorage.getItem('tasks');
    const taskCount = taskStorage ? JSON.parse(taskStorage).length : 0;
    
    // Update demo output with current localStorage info
    let output = 'Current localStorage content:\n';
    output += `- "tasks": ${taskCount} task(s) stored\n`;
    
    // Show other keys (excluding tasks)
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'tasks') {
            const value = localStorage.getItem(key);
            output += `- "${key}": "${value}"\n`;
        }
    }
    
    // Only update if demoOutput exists (it might not be in all pages)
    if (demoOutput) {
        demoOutput.textContent = output;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);