const dataStore = new DataStore();
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskDialog = document.getElementById('taskDialog');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const courseSelect = document.getElementById('courseSelect');
const taskDescription = document.getElementById('taskDescription');
const taskMaterials = document.getElementById('taskMaterials');
const taskDueDate = document.getElementById('taskDueDate');
const taskPriority = document.getElementById('taskPriority');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');
const taskPreview = document.getElementById('taskPreview');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

const renderTasks = () => {
    const filteredTasks = dataStore.tasks.filter(task => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
    });

    taskList.innerHTML = filteredTasks.map(task => `
        <li class="task-item neumorphic micro-interaction ${task.completed ? 'completed' : ''} border border-gray-200" draggable="true" data-id="${task.id}">
            <div class="flex w-full justify-between">
                <div>  
                    <div class="task-header">
                        <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                        <label for="task-${task.id}">${task.text}</label>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                    <div class="task-details">
                        <span class="task-course">${task.course}</span>
                        <p class="task-description">${task.description}</p>
                        <p class="task-materials"><strong>Materials:</strong> ${task.materials}</p>
                        <p class="task-due-date"><strong>Due:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn micro-interaction mb-4 rounded-md" data-id="${task.id}">
                        <span class="p-1">Edit</span>
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="delete-btn micro-interaction" data-id="${task.id}">
                        <span class="p-1">Delete</span>
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
           
            
        </li>
    `).join('');

    // Add event listeners for drag and drop
    taskList.querySelectorAll('.task-item').forEach(taskItem => {
        taskItem.addEventListener('dragstart', dragStart);
        taskItem.addEventListener('dragover', dragOver);
        taskItem.addEventListener('drop', drop);
    });
};

const populateCourseSelect = () => {
    courseSelect.innerHTML = dataStore.getCourses().map(course => `
        <option value="${course}">${course}</option>
    `).join('');
};

const showTaskDialog = (task = null) => {
    taskDialog.style.display = 'flex';
    populateCourseSelect();
    if (task) {
        taskInput.value = task.text;
        courseSelect.value = task.course;
        taskDescription.value = task.description;
        taskMaterials.value = task.materials;
        taskDueDate.value = task.dueDate;
        taskPriority.value = task.priority;
        taskForm.dataset.editId = task.id;
    } else {
        taskForm.reset();
        delete taskForm.dataset.editId;
    }
    updateTaskPreview();
};

const hideTaskDialog = () => {
    taskDialog.style.display = 'none';
    taskForm.reset();
    delete taskForm.dataset.editId;
};

const addOrUpdateTask = (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const course = courseSelect.value;
    const description = taskDescription.value.trim();
    const materials = taskMaterials.value.trim();
    const dueDate = taskDueDate.value;
    const priority = taskPriority.value;

    if (text && course) {
        if (taskForm.dataset.editId) {
            dataStore.updateTask(taskForm.dataset.editId, { text, course, description, materials, dueDate, priority });
        } else {
            dataStore.addTask(text, course, description, materials, dueDate, priority);
        }
        hideTaskDialog();
        renderTasks();
    }
};

const toggleTask = (id) => {
    dataStore.toggleTask(id);
    renderTasks();
};

const deleteTask = (id) => {
    dataStore.deleteTask(id);
    renderTasks();
};

const updateTaskPreview = () => {
    taskPreview.innerHTML = `
        <div class="task-item preview flex-row">
            <div class="task-header">
                <input type="checkbox" disabled>
                <label>${taskInput.value || 'Task Title'}</label>
                <span class="task-priority ${taskPriority.value}">${taskPriority.value}</span>
            </div>
            <div class="task-details">
                <span class="task-course">${courseSelect.value || 'Course'}</span>
                <p class="task-description">${taskDescription.value || 'Task description'}</p>
                <p class="task-materials"><strong>Materials:</strong> ${taskMaterials.value || 'N/A'}</p>
                <p class="task-due-date"><strong>Due:</strong> ${taskDueDate.value ? new Date(taskDueDate.value).toLocaleString() : 'Not set'}</p>
            </div>
        </div>
    `;
};

// Drag and drop functionality
let draggedItem = null;

function dragStart(e) {
    draggedItem = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    setTimeout(() => e.target.style.opacity = '0.5', 0);
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drop(e) {
    e.preventDefault();
    const draggedId = 

 e.dataTransfer.getData('text');
    const dropTarget = e.target.closest('.task-item');
    
    if (dropTarget && draggedItem !== dropTarget) {
        const items = Array.from(taskList.children);
        const fromIndex = items.indexOf(draggedItem);
        const toIndex = items.indexOf(dropTarget);
        
        if (fromIndex < toIndex) {
            taskList.insertBefore(draggedItem, dropTarget.nextSibling);
        } else {
            taskList.insertBefore(draggedItem, dropTarget);
        }
        
        // Update the order in dataStore
        const newTasks = items.map(item => dataStore.tasks.find(task => task.id === item.dataset.id));
        dataStore.tasks = newTasks;
        dataStore.saveTasks();
    }
    draggedItem.style.opacity = '1';
}

addTaskBtn.addEventListener('click', () => showTaskDialog());
cancelTaskBtn.addEventListener('click', hideTaskDialog);
taskForm.addEventListener('submit', addOrUpdateTask);
taskList.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        toggleTask(e.target.closest('.task-item').dataset.id);
    }
});
taskList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        deleteTask(taskItem.dataset.id);
    } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
        const task = dataStore.tasks.find(t => t.id === taskItem.dataset.id);
        showTaskDialog(task);
    }
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

taskForm.addEventListener('input', updateTaskPreview);

renderTasks();