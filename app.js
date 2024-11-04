function handleCustomProtocol(url) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const type = urlParams.get('type');
    const data = urlParams.get('data');
    const dataStore = new DataStore();

    console.log('[Aurora - Main] {cp} handled:', type);

    switch (type) {
        case 'add-task':
            if (data) {
                const [title, course] = data.split('|');
                dataStore.addTask(title, course);
                renderTasks();
                alert(`Task "${title}" added for ${course}`);
            }
            break;
        case 'view-schedule':
            const date = data ? new Date(data) : new Date();
            window.location.href = `/schedule.html?date=${date.toISOString()}`;
            break;
        default:
            console.warn('Unknown custom protocol type:', type);
    }
}


async function handleFiles(files) {
    for (const file of files) {
        if (file.name.endsWith('.aura')) {
            try {
                const contents = await file.text();
                const data = JSON.parse(contents);

                if (data.tasks) {
                    data.tasks.forEach(task => dataStore.addTask(task.text, task.course, task.description, task.materials, task.dueDate, task.priority));
                }
                if (data.events) {
                    data.events.forEach(event => dataStore.addEvent(event.title, event.date, event.course, event.description));
                }
                if (data.grades) {
                    data.grades.forEach(grade => dataStore.addGrade(grade.subject, grade.grade));
                }
                if (data.reminders) {
                    data.reminders.forEach(reminder => dataStore.addReminder(reminder.text, reminder.date));
                }

                alert('Aurora data imported successfully!');
                window.location.reload();
            } catch (error) {
                console.error('Error parsing .aura file:', error);
                alert('Error importing School Planner data. Please check the file format.');
            }
        }
    }
}
async function handleShareTarget() {
    const formData = await new Response(window.location.hash.substr(1)).formData();
    const title = formData.get('title');
    const text = formData.get('text');
    const url = formData.get('url');
    const file = formData.get('file');
    const dataStore = new DataStore();

    console.log('Received shared content:', { title, text, url });

    if (title && text) {
        const taskText = `${title}: ${text}`;
        dataStore.addTask(taskText, 'Shared');
        renderTasks();
        alert('New task added from shared content!');
    }

    if (url) {
        const taskText = `Check resource: ${url}`;
        dataStore.addTask(taskText, 'Shared');
        renderTasks();
        alert('New task added from shared URL!');
    }

    if (file) {
        console.log('Received shared file:', file.name);
        if (file.name.endsWith('.schoolplanner')) {
            await handleFiles([file]);
        } else {
            const taskText = `Review attachment: ${file.name}`;
            dataStore.addTask(taskText, 'Shared');
            renderTasks();
            alert('New task added with attachment!');
        }
    }
    window.location.href = '/tasks.html';
}


function handleShortcut(event) {
    const dataStore = new DataStore();
    switch (event.shortcut) {
        case 'new-task':
            console.log('[Aurora - Main] new.task shortcut triggered');
            const taskText = prompt('Enter new task:');
            if (taskText) {
                dataStore.addTask(taskText, 'Quick Add');
                alert('New task added!');
            }
            break;
        case 'view-schedule':
            console.log('[Aurora - Main] view.schedule shortcut triggered');
            window.location.href = '/schedule.html';
            break;
    }
}

const requiredElements = [
    {
        type: 'script',
        attributes: { src: '/js/dataStore.js' }
    },
    {
        type: 'script',
        attributes: { src: '/js/checkboxes.js' }
    },
    {
        type: 'link',
        attributes: { rel: 'manifest', href: '/manifest.json' }
    },
    {
        type: 'link',
        attributes: { rel: 'icon', href: 'icons/1024.png' }
    },
    {
        type: 'link',
        attributes: { rel: 'stylesheet', href: '/scss/style.scss' }
    },
    {
        type: 'link',
        attributes: { rel: 'stylesheet', href: '/scss/s.compiled.css' }
    }
];

function ensureHeadElements() {

    requiredElements.forEach(element => {
        const selector = Object.entries(element.attributes)
            .map(([key, value]) => `[${key}="${value}"]`)
            .join('');
            
        const exists = document.head.querySelector(`${element.type}${selector}`);
        
        if (!exists) {
            const newElement = document.createElement(element.type);
            Object.entries(element.attributes).forEach(([key, value]) => {
                newElement.setAttribute(key, value);
            });
            document.head.appendChild(newElement);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const dataStore = new DataStore();
    ensureHeadElements();
    console.log("[Aurora - Main] aurora.base {reg}")
    if (window.location.pathname === '/share-target/') {
        handleShareTarget();
    }
    navigator.registerProtocolHandler('web+aurora', '%s')
    if (window.location.protocol === 'web+aurora:') {
        handleCustomProtocol(window.location.href);
    }
    if ('launchQueue' in window) {
        window.launchQueue.setConsumer(launchParams => {
            if (launchParams.files && launchParams.files.length) {
                handleFiles(launchParams.files);
            }
        });
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('[Aurora - Main] sw.js registered [scope:', registration.scope, "]");
            })
            .catch(error => {
                console.warn('[Aurora - Main] sw.js reg failed:', error);
            });
    }
    if ('shortcuts' in navigator) {
        navigator.shortcuts.addEventListener('shortcut', handleShortcut);
    }
    // if (window.location.pathname != '/welcome.html' || window.location.pathname != '/welcome') {
    //     if (!dataStore.getUserName() && !dataStore.getCourses().length > 0) {
    //         window.location.href = 'welcome.html';
    //     }
    // }
    
    const upcomingNotifications = document.getElementById('notification-counter');
    upcomingNotifications.innerText = dataStore.reminders.length ;

});