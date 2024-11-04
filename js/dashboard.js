const store = new DataStore();

document.addEventListener("DOMContentLoaded", () => {
    const userNameElements = document.querySelectorAll('#user-name, #header-user-name');
    const todayTasksElement = document.getElementById('today-tasks');
    const upcomingEventsElement = document.getElementById('upcoming-events-count');
    const averageGradeElement = document.getElementById('average-grade');
    const taskListElement = document.getElementById('task-list');
    const upcomingEventsContainer = document.getElementById('upcomingEvents');
    const upcomingRemindersContainer = document.getElementById('upcomingReminders');
    const quickAddModal = document.getElementById('quick-add-modal');
    const quickAddForm = document.getElementById('quick-add-form');
    const addBtn = document.getElementById('addEventBtn');
    const gradeOverviewChart = document.getElementById('gradeOverview');

    initializeDashboard();
    setupEventListeners();
    updateCounters();
    
    function initializeDashboard() {
        updateUserProfile();
        updateSummaryStats();
        renderGradeOverview();
        renderUpcomingEvents();
        renderUpcomingReminders();
        renderTaskList();
    }

    function updateUserProfile() {
        const userName = store.getUserName() || 'Guest';
        userNameElements.forEach(element => {
            element.textContent = userName;
        });
    }

    function updateSummaryStats() {
        const todayTasks = store.tasks.filter(task => {
            return !task.completed;
        }).length;
        todayTasksElement.textContent = todayTasks;
        const upcomingEvents = store.events.filter(event => {
            const eventDate = moment(event.date);
            return eventDate.isAfter(moment());
        }).length;
        upcomingEventsElement.textContent = upcomingEvents;

        const grades = store.grades;
        const average = grades.length
            ? (grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length).toFixed(1)
            : '--';
        averageGradeElement.textContent = `${average}`;
    }

    function renderGradeOverview() {
        const grades = store.grades;
        const subjects = grades.map(grade => grade.subject);
        const gradeValues = grades.map(grade => grade.grade);

        new Chart(gradeOverviewChart, {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Grade (%)',
                    data: gradeValues,
                    backgroundColor: '#4F46E5',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    function renderUpcomingEvents() {
        const events = store.events
            .filter(event => moment(event.date).isAfter(moment()))
            .sort((a, b) => moment(a.date).diff(moment(b.date)))
            .slice(0, 5);

        upcomingEventsContainer.innerHTML = events.length ? events.map(event => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
                <h4 class="font-medium">${event.title}</h4>
                <p class="text-sm text-gray-600">${moment(event.date).format('MMM D, YYYY')}</p>
            </div>
            <div class="flex space-x-2">
                <button onclick="editEvent('${event.id}')" class="text-gray-600 hover:text-indigo-600">
                    <i class="ri-edit-line"></i>
                </button>
                <button onclick="deleteEvent('${event.id}')" class="text-gray-600 hover:text-red-600">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        </div>
    `).join('') : '<p class="text-gray-500 text-center">No upcoming events</p>';
    }

    function renderUpcomingReminders() {
        const reminders = store.reminders
            .filter(reminder => moment(reminder.date).isAfter(moment()))
            .sort((a, b) => moment(a.date).diff(moment(b.date)))
            .slice(0, 5);

        upcomingRemindersContainer.innerHTML = reminders.length ? reminders.map(reminder => `
        <div class="reminder-item">
            <div>
                <h4 class="font-medium">${reminder.text}</h4>
                <p class="text-sm text-gray-600">${moment(reminder.date).format('MMM D, YYYY')}</p>
            </div>
            <button onclick="deleteReminder('${reminder.id}')" class="text-gray-600 hover:text-red-600">
                <i class="ri-delete-bin-line"></i>
            </button>
        </div>
    `).join('') : '<p class="text-gray-500 text-center">No upcoming reminders</p>';
    }

    function renderTaskList() {
        const tasks = store.tasks
            .filter(task => !task.completed)
            .slice(0, 5);

        taskListElement.innerHTML = tasks.length ? tasks.map(task => `
        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div class="flex items-center space-x-3">
                <input type="checkbox" 
                       id="task-${task.id}" 
                       ${task.completed ? 'checked' : ''}
                       onchange="toggleTask('${task.id}')"
                       class="rounded text-indigo-600">
                <label for="task-${task.id}" class="text-sm">${task.text}</label>
            </div>
            <button onclick="deleteTask('${task.id}')" class="text-gray-600 hover:text-red-600">
                <i class="ri-delete-bin-line"></i>
            </button>
        </div>
    `).join('') : '<p class="text-gray-500 text-center">No pending tasks</p>';
    }

    function setupEventListeners() {
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
        addBtn.addEventListener('click', openQuickAddModal);
        document.getElementById('quick-add-type').addEventListener('change', updateQuickAddForm);
        document.getElementById('close-modal').addEventListener('click', closeQuickAddModal);
        document.getElementById('cancel-quick-add').addEventListener('click', closeQuickAddModal);
        document.getElementById('save-quick-add').addEventListener('click', handleQuickAdd);
    }

    function updateQuickAddForm() {
        const type = document.getElementById('quick-add-type').value;
        const formHTML = {
            task: `
            <input type="text" placeholder="Task Name" id="quick-add-title" class="w-full p-2 border rounded">
            <select id="quick-add-course" class="w-full p-2 border rounded">
                ${store.getCourses().map(course => `<option value="${course}">${course}</option>`).join('')}
            </select>
            <textarea id="quick-add-description" placeholder="Description" class="w-full p-2 border rounded"></textarea>
        `,
            event: `
            <input type="text" placeholder="Event Title" id="quick-add-title" class="w-full p-2 border rounded">
            <input type="datetime-local" id="quick-add-date" class="w-full p-2 border rounded">
            <textarea id="quick-add-description" placeholder="Description" class="w-full p-2 border rounded"></textarea>
        `,
            reminder: `
            <input type="text" placeholder="Reminder Text" id="quick-add-text" class="w-full p-2 border rounded">
            <input type="datetime-local" id="quick-add-date" class="w-full p-2 border rounded">
        `
        }[type];

        quickAddForm.innerHTML = formHTML;
    }

    function handleQuickAdd() {
        const type = document.getElementById('quick-add-type').value;

        switch (type) {
            case 'task':
                store.addTask(
                    document.getElementById('quick-add-title').value,
                    document.getElementById('quick-add-course').value,
                    document.getElementById('quick-add-description').value,
                    []
                );
                break;
            case 'event':
                store.addEvent(
                    document.getElementById('quick-add-title').value,
                    document.getElementById('quick-add-date').value,
                    '',
                    'medium',
                    document.getElementById('quick-add-description').value
                );
                break;
            case 'reminder':
                store.addReminder(
                    document.getElementById('quick-add-text').value,
                    document.getElementById('quick-add-date').value
                );
                break;
        }

        closeQuickAddModal();
        initializeDashboard();
    }

    function openQuickAddModal() {
        quickAddModal.classList.remove('hidden');
        quickAddModal.classList.add('flex');
        updateQuickAddForm();
    }

    function closeQuickAddModal() {
        quickAddModal.classList.remove('flex');
        quickAddModal.classList.add('hidden');
    }

    function toggleTheme() {
        const icon = document.querySelector('#theme-toggle i');
        if (document.body.classList.contains('dark')) {
            document.body.classList.remove('dark');
            icon.classList.remove('ri-moon-line');
            icon.classList.add('ri-sun-line');
        } else {
            document.body.classList.add('dark');
            icon.classList.remove('ri-sun-line');
            icon.classList.add('ri-moon-line');
        }
    }

    function updateCounters() {
        const tasksCounter = document.getElementById('tasks-counter');

        const pendingTasks = store.tasks.filter(task => !task.completed).length;

        if (pendingTasks > 0) {
            tasksCounter.textContent = pendingTasks;
            tasksCounter.classList.remove('hidden');
        } else {
            tasksCounter.classList.add('hidden');
        }
    }
})

function toggleTask(id) {
    store.toggleTask(id);
    updateSummaryStats();
    renderTaskList();
}

function deleteTask(id) {
    store.deleteTask(id);
    updateSummaryStats();
    renderTaskList();
}

function deleteEvent(id) {
    store.deleteEvent(id);
    updateSummaryStats();
    renderUpcomingEvents();
}

function deleteReminder(id) {
    store.deleteReminder(id);
    renderUpcomingReminders();
}
