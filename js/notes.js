const store = new DataStore();

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
    deleteNote: document.getElementById('deleteNote'),
    saveNote: document.getElementById('saveNote'),
    editor: document.getElementById('editor'),
    preview: document.getElementById('preview'),
    wordCount: document.getElementById('wordCount'),
    formatBold: document.getElementById('formatBold'),
    formatItalic: document.getElementById('formatItalic'),
    formatUnderline: document.getElementById('formatUnderline'),
    formatStrike: document.getElementById('formatStrike'),
    formatList: document.getElementById('formatList'),
    formatNumberList: document.getElementById('formatNumberList'),
    alignLeft: document.getElementById('alignLeft'),
    alignCenter: document.getElementById('alignCenter'),
    alignRight: document.getElementById('alignRight'),
    undoBtn: document.getElementById('undoBtn'),
    redoBtn: document.getElementById('redoBtn'),
    fontStyle: document.getElementById('fontStyle'),
    togglePreview: document.getElementById('togglePreview'),
    editMode: document.getElementById('editMode'),
    previewMode: document.getElementById('previewMode'),
    tableModal: document.getElementById('tableModal'),
    insertTable: document.getElementById('insertTable'),
    confirmTable: document.getElementById('confirmTable'),
    cancelTable: document.getElementById('cancelTable'),
    tableRows: document.getElementById('tableRows'),
    tableColumns: document.getElementById('tableColumns')
};

let currentSubjectId = null;
let currentNoteId = null;

function initializeApp() {
    renderSubjects();
    setupEventListeners();
    setupEditorEventListeners();
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
}

function setupEditorEventListeners() {
    elements.formatBold.addEventListener('click', () => execCommand('bold'));
    elements.formatItalic.addEventListener('click', () => execCommand('italic'));
    elements.formatUnderline?.addEventListener('click', () => execCommand('underline'));
    elements.formatStrike?.addEventListener('click', () => execCommand('strikethrough'));
    elements.alignLeft?.addEventListener('click', () => execCommand('justifyLeft'));
    elements.alignCenter?.addEventListener('click', () => execCommand('justifyCenter'));
    elements.alignRight?.addEventListener('click', () => execCommand('justifyRight'));
    elements.formatList?.addEventListener('click', () => execCommand('insertUnorderedList'));
    elements.formatNumberList?.addEventListener('click', () => execCommand('insertOrderedList'));
    elements.undoBtn?.addEventListener('click', () => execCommand('undo'));
    elements.redoBtn?.addEventListener('click', () => execCommand('redo'));
    elements.fontStyle?.addEventListener('change', (e) => {
        execCommand('formatBlock', e.target.value);
    });
    elements.togglePreview?.addEventListener('click', togglePreviewMode);
    elements.insertTable?.addEventListener('click', () => {
        elements.tableModal.classList.remove('hidden');
    });

    elements.confirmTable?.addEventListener('click', () => {
        const rows = elements.tableRows.value;
        const cols = elements.tableColumns.value;
        insertTable(rows, cols);
        elements.tableModal.classList.add('hidden');
    });

    elements.cancelTable?.addEventListener('click', () => {
        elements.tableModal.classList.add('hidden');
    });
    elements.editor?.addEventListener('input', updateWordCount);
    elements.editor?.addEventListener('paste', handlePaste);
}

function execCommand(command, value = null) {
    document.execCommand(command, false, value);
    elements.editor?.focus();
}

function updateWordCount() {
    if (!elements.editor || !elements.wordCount) return;
    const text = elements.editor.innerText || '';
    const words = text.trim().split(/\s+/).length;
    elements.wordCount.textContent = `Words: ${words}`;
}

function togglePreviewMode() {
    if (!elements.editMode || !elements.previewMode || !elements.togglePreview) return;
    
    if (elements.editMode.classList.contains('hidden')) {
        elements.editMode.classList.remove('hidden');
        elements.previewMode.classList.add('hidden');
        elements.togglePreview.innerHTML = '<i class="fas fa-eye mr-2"></i>Preview';
    } else {
        elements.editMode.classList.add('hidden');
        elements.previewMode.classList.remove('hidden');
        elements.togglePreview.innerHTML = '<i class="fas fa-edit mr-2"></i>Edit';
        elements.preview.innerHTML = DOMPurify.sanitize(marked.parse(elements.editor.innerHTML));
    }
}

function insertTable(rows, cols) {
    let table = '<table class="border-collapse table-auto w-full"><tbody>';
    for (let i = 0; i < rows; i++) {
        table += '<tr>';
        for (let j = 0; j < cols; j++) {
            table += '<td class="border border-gray-300 p-2"><br></td>';
        }
        table += '</tr>';
    }
    table += '</tbody></table><p><br></p>';
    
    execCommand('insertHTML', table);
}

function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
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
            <p class="text-gray-600">${getNoteCount(course)} notes</p>
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

// Animation utility functions
function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.classList.remove('hidden');
    
    const start = performance.now();
    
    requestAnimationFrame(function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    });
}

function fadeOut(element, duration = 300) {
    return new Promise(resolve => {
        const start = performance.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        requestAnimationFrame(function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = initialOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.classList.add('hidden');
                element.style.opacity = initialOpacity;
                resolve();
            }
        });
    });
}

function slideIn(element, duration = 300, direction = 'right') {
    element.style.opacity = 0;
    element.classList.remove('hidden');
    
    const start = performance.now();
    const distance = direction === 'right' ? 20 : -20;
    
    requestAnimationFrame(function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = progress;
        element.style.transform = `translateX(${distance * (1 - progress)}px)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.transform = '';
        }
    });
}

async function createNewNote() {
    currentNoteId = null;
    
    // Fade out current content if any
    if (!elements.noteEditor.classList.contains('hidden')) {
        await fadeOut(elements.noteEditor);
    }
    
    // Reset editors
    elements.noteTitle.value = '';
    if (elements.editor) {
        elements.editor.innerHTML = '';
        updateWordCount();
    }
    if (elements.noteContent) {
        elements.noteContent.value = '';
    }
    
    // Reset preview if it exists
    if (elements.preview) {
        elements.preview.innerHTML = '';
    }
    
    // Show editor and animate
    showNoteEditor();
    fadeIn(elements.noteEditor);
    
    // Hide delete button with animation
    if (!elements.deleteNote.classList.contains('hidden')) {
        await fadeOut(elements.deleteNote);
    }
    
    // Reset editor mode if preview was active
    if (elements.editMode && elements.editMode.classList.contains('hidden')) {
        elements.editMode.classList.remove('hidden');
        elements.previewMode?.classList.add('hidden');
        elements.togglePreview.innerHTML = '<i class="fas fa-eye mr-2"></i>Preview';
    }
    
    // Focus title with a slight delay to ensure animations are smooth
    setTimeout(() => elements.noteTitle.focus(), 300);
}

async function openNote(noteId) {
    const note = store.notes.find(n => n.id === noteId);
    if (note) {
        // Fade out current content
        if (!elements.noteEditor.classList.contains('hidden')) {
            await fadeOut(elements.noteEditor);
        }
        
        currentNoteId = noteId;
        elements.noteTitle.value = note.title;
        
        // Handle both rich text and plain text editors
        if (elements.editor) {
            elements.editor.innerHTML = note.content;
            updateWordCount();
        }
        if (elements.noteContent) {
            elements.noteContent.value = note.content;
        }
        
        // Show editor with animation
        showNoteEditor();
        fadeIn(elements.noteEditor);
        slideIn(elements.deleteNote);
        elements.deleteNote.classList.remove('hidden');
    }
}

async function saveCurrentNote() {
    const title = elements.noteTitle.value.trim();
    let content = '';
    
    // Get content from either rich text or plain text editor
    if (elements.editor) {
        content = elements.editor.innerHTML.trim();
    } else if (elements.noteContent) {
        content = elements.noteContent.value.trim();
    }
    
    if (!title && !content) return;
    
    // Show saving indicator
    const saveIndicator = document.createElement('div');
    saveIndicator.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform translate-y-full';
    saveIndicator.textContent = 'Saving...';
    document.body.appendChild(saveIndicator);
    
    // Animate saving indicator
    requestAnimationFrame(() => {
        saveIndicator.style.transition = 'transform 0.3s ease-out';
        saveIndicator.style.transform = 'translate-y-0';
    });
    
    try {
        if (currentNoteId) {
            await store.updateNote(currentNoteId, { title, content });
        } else {
            const newNote = await store.addNote(title, content, currentSubjectId);
            currentNoteId = newNote.id;
            elements.deleteNote.classList.remove('hidden');
            slideIn(elements.deleteNote);
        }
        
        // Update save indicator
        saveIndicator.textContent = 'Saved!';
        saveIndicator.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
        
        // Refresh note list with animation
        await fadeOut(elements.notesList);
        renderNotesList();
        fadeIn(elements.notesList);
        
    } catch (error) {
        console.error('Error saving note:', error);
        saveIndicator.textContent = 'Error saving!';
        saveIndicator.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
    }
    
    // Remove saving indicator after delay
    setTimeout(() => {
        saveIndicator.style.transform = 'translate-y-full';
        setTimeout(() => saveIndicator.remove(), 300);
    }, 2000);
}

async function deleteCurrentNote() {
    if (!currentNoteId) return;
    
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
    dialog.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm w-full transform scale-95 opacity-0 transition-all duration-200">
            <h3 class="text-lg font-semibold mb-4">Delete Note</h3>
            <p class="text-gray-600 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div class="flex justify-end space-x-3">
                <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" id="cancelDelete">
                    Cancel
                </button>
                <button class="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors" id="confirmDelete">
                    Delete
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);

    requestAnimationFrame(() => {
        dialog.querySelector('div').classList.remove('scale-95', 'opacity-0');
    });
    
    return new Promise((resolve) => {
        dialog.querySelector('#cancelDelete').addEventListener('click', async () => {
            dialog.querySelector('div').classList.add('scale-95', 'opacity-0');
            await new Promise(r => setTimeout(r, 200));
            dialog.remove();
            resolve(false);
        });
        
        dialog.querySelector('#confirmDelete').addEventListener('click', async () => {
            dialog.querySelector('div').classList.add('scale-95', 'opacity-0');
            await new Promise(r => setTimeout(r, 200));
            dialog.remove();
            resolve(true);
        });
    }).then(async (confirmed) => {
        if (confirmed) {
            const noteElement = document.querySelector(`[onclick="openNote('${currentNoteId}')"]`);
            if (noteElement) {
                await fadeOut(noteElement);
            }
            
            await store.deleteNote(currentNoteId);
            currentNoteId = null;
            
            await fadeOut(elements.notesList);
            renderNotesList();
            fadeIn(elements.notesList);
            
            showEmptyState();
        }
    });
}

// Additional helper function for smooth transitions between editor states
function showNoteEditor() {
    if (elements.emptyState && !elements.emptyState.classList.contains('hidden')) {
        fadeOut(elements.emptyState);
    }
    elements.noteEditor.classList.remove('hidden');
    fadeIn(elements.noteEditor);
}
function showEmptyState() {
    elements.emptyState.classList.remove('hidden');
    elements.noteEditor.classList.add('hidden');
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

function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.classList.remove('hidden');
    
    const start = performance.now();
    
    requestAnimationFrame(function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    });
}

function fadeOut(element, duration = 300) {
    return new Promise(resolve => {
        const start = performance.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        requestAnimationFrame(function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = initialOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.classList.add('hidden');
                element.style.opacity = initialOpacity;
                resolve();
            }
        });
    });
}

function slideIn(element, duration = 300, direction = 'right') {
    element.style.opacity = 0;
    element.classList.remove('hidden');
    
    const start = performance.now();
    const distance = direction === 'right' ? 20 : -20;
    
    requestAnimationFrame(function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = progress;
        element.style.transform = `translateX(${distance * (1 - progress)}px)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.transform = '';
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.showNotesScreen = showNotesScreen;
window.openNote = openNote;