const safeJSONParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error parsing ${key} from localStorage:`, error);
        return fallback;
    }
};

const safeLocalStorageSet = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting ${key} in localStorage:`, error);
    }
};

class DataStore {
    constructor() {
        this.tasks = safeJSONParse('tasks', []);
        this.events = safeJSONParse('events', []);
        this.grades = safeJSONParse('grades', []);
        this.reminders = safeJSONParse('reminders', []);
        this.notes = safeJSONParse('notes', []); 
        this.userName = '';
        this.courses = [];
        this.loadUserProfile();
        this.loadEvents();
        this.loadNotes();
    }

    setUserName(name) {
        this.userName = name;
        this.saveUserProfile();
    }

    getUserName() {
        return this.userName;
    }

    setCourses(courses) {
        this.courses = courses;
        this.saveUserProfile();
    }

    getCourses() {
        return this.courses;
    }

    saveUserProfile() {
        localStorage.setItem('userProfile', JSON.stringify({
            userName: this.userName,
            courses: this.courses
        }));
    }

    loadUserProfile() {
        const userProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (userProfile) {
            this.userName = userProfile.userName;
            this.courses = userProfile.courses;
        }
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }

    getEvents() {
        return this.events;
    }

    getEvent(id) {
        return this.events.find(event => event.id === id);
    }

    loadNotes() {
        const notes = safeJSONParse('notes', []);
        if (notes) {
            this.notes = notes;
        }
    }

    saveNotes() {
        safeLocalStorageSet('notes', this.notes);
    }

    addNote(title, content, courseId, tags = [], attachments = []) {
        const note = {
            id: this.generateId(),
            title,
            content,
            courseId,
            tags,
            attachments,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.notes.push(note);
        this.saveNotes();
        return note;
    }

    updateNote(id, updates) {
        const index = this.notes.findIndex(note => note.id === id);
        if (index !== -1) {
            this.notes[index] = {
                ...this.notes[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveNotes();
            return this.notes[index];
        }
        return null;
    }

    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
    }

    getNotesByCourse(courseId) {
        return this.notes.filter(note => note.courseId === courseId);
    }

    searchNotes(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.notes.filter(note => 
            note.title.toLowerCase().includes(lowercaseQuery) ||
            note.content.toLowerCase().includes(lowercaseQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
    }

    addTagToNote(noteId, tag) {
        const note = this.notes.find(n => n.id === noteId);
        if (note && !note.tags.includes(tag)) {
            note.tags.push(tag);
            this.saveNotes();
            return true;
        }
        return false;
    }

    removeTagFromNote(noteId, tag) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.tags = note.tags.filter(t => t !== tag);
            this.saveNotes();
            return true;
        }
        return false;
    }

    addAttachmentToNote(noteId, attachment) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.attachments.push(attachment);
            this.saveNotes();
            return true;
        }
        return false;
    }

    removeAttachmentFromNote(noteId, attachmentId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.attachments = note.attachments.filter(a => a.id !== attachmentId);
            this.saveNotes();
            return true;
        }
        return false;
    }

    updateEvent(id, eventData) {
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
            this.events[index] = {
                ...this.events[index],
                ...eventData
            };
            this.saveEvents();
            return this.events[index];
        }
        return null;
    }

    addEvent(title, date, course, priority,description) {
        const event = {
            id: Date.now().toString(36)+ Math.random().toString(36),
            title,
            date,
            course,
            priority,
            description
        };
        this.events.push(event);
        this.saveEvents();
    }

    deleteEvent(id) {
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
            this.events.splice(index, 1);
            this.saveEvents();
            return true;
        }
        return false;
    } 


    loadEvents() {
        const events = JSON.parse(localStorage.getItem('events'));
        if (events) {
            this.events = events;
        }
    }

    addTask(text, course, description, materials) {
        const task = {
            id: Date.now().toString(),
            text,
            course,
            description,
            materials,
            completed: false
        };
        this.tasks.push(task);
        this.saveTasks();
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (tasks) {
            this.tasks = tasks;
        }
    }

    addEvent(title, date) {
        const newEvent = { id: Date.now().toString(), title, date };
        this.events.push(newEvent);
        safeLocalStorageSet('events', this.events);
        return newEvent;
    }

    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        safeLocalStorageSet('events', this.events);
    }

    addGrade(subject, grade) {
        const newGrade = { id: Date.now().toString(), subject, grade: Number(grade) };
        this.grades.push(newGrade);
        safeLocalStorageSet('grades', this.grades);
        return newGrade;
    }

    deleteGrade(id) {
        this.grades = this.grades.filter(g => g.id !== id);
        safeLocalStorageSet('grades', this.grades);
    }

    addReminder(text, date) {
        const newReminder = { id: Date.now().toString(), text, date };
        this.reminders.push(newReminder);
        safeLocalStorageSet('reminders', this.reminders);
        return newReminder;
    }

    deleteReminder(id) {
        this.reminders = this.reminders.filter(r => r.id !== id);
        safeLocalStorageSet('reminders', this.reminders);
    }
}

