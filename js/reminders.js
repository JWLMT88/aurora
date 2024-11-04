document.addEventListener('DOMContentLoaded', () => {
    const dataStore = new DataStore();
    const reminderAddButton = document.getElementById("openAddReminder");
    const addReminderModal = document.getElementById("reminderModal");
    const reminderForm = document.getElementById('reminderForm');
    const reminderText = document.getElementById('reminderText');
    const reminderDate = document.getElementById('reminderDate');
    const reminderList = document.getElementById('reminderList');
    const closeAddCourseModalBtn = document.getElementById('closeModal');

    reminderAddButton.addEventListener('click', () => {
        addReminderModal.classList.remove('hidden');
        document.getElementById("main-container").classList.add("animate-slope");
        reminderText.focus();
    });

    closeAddCourseModalBtn.addEventListener('click', () => {
        addReminderModal.classList.add('hidden');
        document.getElementById("main-container").classList.remove("animate-slope");
        reminderForm.reset();
    });

    const renderReminders = () => {
        reminderList.innerHTML = dataStore.reminders.map(reminder => `
        <div class="reminder-item">
            <span>${reminder.text} - ${new Date(reminder.date).toLocaleString()}</span>
            <button class="delete-btn" data-id="${reminder.id}">Delete</button>
        </div>
    `).join('');
    };

    const addReminder = (e) => {
        e.preventDefault();
        const text = reminderText.value.trim();
        const date = reminderDate.value;
        if (text && date) {
            dataStore.addReminder(text, date);
            reminderText.value = '';
            reminderDate.value = '';
            renderReminders();
        }
    };

    const deleteReminder = (id) => {
        dataStore.deleteReminder(id);
        renderReminders();
    };

    reminderForm.addEventListener('submit', addReminder);
    reminderList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteReminder(e.target.dataset.id);
        }
    });

    renderReminders();

    setInterval(() => {
        const now = new Date();
        dataStore.reminders.forEach(reminder => {
            const reminderDate = new Date(reminder.date);
            if (reminderDate <= now) {
                if (Notification.permission === "granted") {
                    new Notification("Reminder", { body: reminder.text });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("Reminder", { body: reminder.text });
                        }
                    });
                }
                dataStore.deleteReminder(reminder.id);
            }
        });
        renderReminders();
    }, 60000);

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});
