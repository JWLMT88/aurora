// Initialize DataStore
const store = new DataStore();

// DOM Elements
const elements = {
    subjectScreen: document.getElementById('subjectScreen'),
    notesScreen: document.getElementById('notesScreen'),
    addSubjectModal: document.getElementById('addSubjectModal'),
    subjectGrid: document.getElementById('subjectGrid'),
    addSubjectBtn: document.getElementById('addSubjectBtn'),
    confirmAddSubject: document.getElementById('confirmAddSubject'),
    cancelAddSubject: document.getElementById('cancelAddSubject'),
    subjectName: document.getElementById('subjectName'),
    backToSubjects: document.getElementById('backToSubjects'),
    currentSubject: document.getElementById('currentSubject'),
    searchNotes: document.getElementById('searchNotes'),
    notesList: document.getElementById('notesList'),
    newNoteBtn: document.getElementById('newNoteBtn'),
    emptyState: document.getElementById('emptyState'),
    noteEditor: document.getElementById('noteEditor'),
    noteTitle: document.getElementById('noteTitle'),
    noteContent: document.getElementById('noteContent'),
    formatBold: document.getElementById('formatBold'),
    formatItalic: document.getElementById('formatItalic'),
    formatList: document.getElementById('formatList'),
    deleteNote: document.getElementById('deleteNote'),
    saveNote: document.getElementById('saveNote')
};

let currentSubjectId = null;
let currentNoteId = null;

function initializeApp() {
    renderSubjects();
    setupEventListeners();
}

function setupEventListeners() {
    elements.addSubjectBtn.addEventListener('click', () => toggleModal(true));
    elements.confirmAddSubject.addEventListener('click', handleAddSubject);
    elements.cancelAddSubject.addEventListener('click', () => toggleModal(false));
    elements.backToSubjects.addEventListener('click', showSubjectScreen);
    
    elements.newNoteBtn.addEventListener('click', createNewNote);
    elements.saveNote.addEventListener('click', saveCurrentNote);
    elements.deleteNote.addEventListener('click', deleteCurrentNote);
    elements.searchNotes.addEventListener('input', handleSearchNotes);

    elements.formatBold.addEventListener('click', () => insertMarkdown('**', '**'));
    elements.formatItalic.addEventListener('click', () => insertMarkdown('*', '*'));
    elements.formatList.addEventListener('click', () => insertMarkdown('\n- ', ''));
}

function toggleModal(show) {
    elements.addSubjectModal.classList.toggle('hidden', !show);
    if (show) {
        elements.subjectName.value = '';
        elements.subjectName.focus();
    }
}

function handleAddSubject() {
    const subjectName = elements.subjectName.value.trim();
    if (subjectName) {
        const courses = store.getCourses();
        const newCourse = {
            id: store.generateId(),
            name: subjectName
        };
        courses.push(newCourse);
        store.setCourses(courses);
        renderSubjects();
        toggleModal(false);
    }
}

function renderSubjects() {
    const courses = store.getCourses();
    const subjectsHTML = courses.map(course => `
        <div class="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
             onclick="showNotesScreen('${course}', '${course}')">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">${course}</h3>
            <p class="text-gray-600">${getNoteCount(course.id)} notes</p>
        </div>
    `).join('');
    
    elements.subjectGrid.innerHTML = subjectsHTML + elements.addSubjectBtn.outerHTML;
}

function getNoteCount(courseId) {
    return store.getNotesByCourse(courseId).length;
}

function showNotesScreen(subjectId, subjectName) {
    currentSubjectId = subjectId;
    elements.currentSubject.textContent = subjectName;
    elements.subjectScreen.classList.add('hidden');
    elements.notesScreen.classList.remove('hidden');
    renderNotesList();
    showEmptyState();
}

function showSubjectScreen() {
    elements.subjectScreen.classList.remove('hidden');
    elements.notesScreen.classList.add('hidden');
    currentSubjectId = null;
    currentNoteId = null;
}

function renderNotesList(searchQuery = '') {
    const notes = searchQuery 
        ? store.searchNotes(searchQuery)
        : store.getNotesByCourse(currentSubjectId);

    elements.notesList.innerHTML = notes.map(note => `
        <div class="note-item p-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${note.id === currentNoteId ? 'border-2 border-blue-500' : ''}"
             onclick="openNote('${note.id}')">
            <h3 class="font-semibold text-gray-800 mb-1">${note.title || 'Untitled'}</h3>
            <p class="text-sm text-gray-600">${formatDate(note.updatedAt)}</p>
        </div>
    `).join('');
}

function handleSearchNotes(event) {
    renderNotesList(event.target.value.trim());
}

function createNewNote() {
    currentNoteId = null;
    elements.noteTitle.value = '';
    elements.noteContent.value = '';
    showNoteEditor();
    elements.deleteNote.classList.add('hidden');
    elements.noteTitle.focus();
}

function openNote(noteId) {
    const note = store.notes.find(n => n.id === noteId);
    if (note) {
        currentNoteId = noteId;
        elements.noteTitle.value = note.title;
        elements.noteContent.value = note.content;
        elements.deleteNote.classList.remove('hidden');
        showNoteEditor();
    }
}

function saveCurrentNote() {
    const title = elements.noteTitle.value.trim();
    const content = elements.noteContent.value.trim();

    if (!title && !content) return;

    if (currentNoteId) {
        store.updateNote(currentNoteId, { title, content });
    } else {
        const newNote = store.addNote(title, content, currentSubjectId);
        currentNoteId = newNote.id;
    }

    renderNotesList();
    elements.deleteNote.classList.remove('hidden');
}

function deleteCurrentNote() {
    if (currentNoteId && confirm('Are you sure you want to delete this note?')) {
        store.deleteNote(currentNoteId);
        currentNoteId = null;
        renderNotesList();
        showEmptyState();
    }
}

function showEmptyState() {
    elements.emptyState.classList.remove('hidden');
    elements.noteEditor.classList.add('hidden');
}

function showNoteEditor() {
    elements.emptyState.classList.add('hidden');
    elements.noteEditor.classList.remove('hidden');
}

function insertMarkdown(prefix, suffix) {
    const textarea = elements.noteContent;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    textarea.value = beforeText + prefix + selectedText + suffix + afterText;
    
    const newCursorPos = end + prefix.length + suffix.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.showNotesScreen = showNotesScreen;
window.openNote = openNote;