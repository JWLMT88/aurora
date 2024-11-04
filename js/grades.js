document.addEventListener('DOMContentLoaded', () => {
    const dataStore = new DataStore();
    const courseList = document.getElementById('courseList');
    const overallMedianDisplay = document.getElementById('overallMedian');
    const gradeModal = document.getElementById('gradeModal');
    const editorTitle = document.getElementById('editorTitle');
    const gradeForm = document.getElementById('gradeForm');
    const gradeInput = document.getElementById('gradeInput');
    const closeModalBtn = document.getElementById('closeModal');
    const courseMedianDisplay = document.getElementById('courseMedian');
    const gradeList = document.getElementById('gradeList');
    const openAddCourseModalBtn = document.getElementById('openAddCourseModal');
    const addCourseModal = document.getElementById('addCourseModal');
    const addCourseForm = document.getElementById('addCourseForm');
    const courseNameInput = document.getElementById('courseNameInput');
    const closeAddCourseModalBtn = document.getElementById('closeAddCourseModal');
    let grades = dataStore.grades;
    let currentCourse = null;
    let courseGrades = [];

    openAddCourseModalBtn.addEventListener('click', () => {
        addCourseModal.classList.remove('hidden');
        document.getElementById("main-container").classList.add("animate-slope");
        courseNameInput.focus();
    });

    closeAddCourseModalBtn.addEventListener('click', () => {
        addCourseModal.classList.add('hidden');
        document.getElementById("main-container").classList.remove("animate-slope");
        addCourseForm.reset();
    });

    addCourseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const courseName = courseNameInput.value.trim();

        if (courseName) {
            dataStore.setCourses([...dataStore.getCourses(), courseName]);  
            displayCourses();  
            addCourseModal.classList.add('hidden');  
            document.getElementById("main-container").classList.remove("animate-slope");
            addCourseForm.reset();
        }
    });

    function displayCourses() {
        const courses = dataStore.getCourses();
        courseList.innerHTML = '';
        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'glass-card p-6 rounded-lg shadow-md cursor-pointer';
            courseCard.innerHTML = `
                <h4 class="text-lg font-semibold text-gray-800">${course}</h4>
                <p class="text-sm text-gray-600">Median: ${calculateMedian(getGradesByCourse(course))}</p>
                <button x-date="remove" class="absolute top-2 bottom-2 right-2 text-gray-400 hover:text-red-500 transition bg-white" onclick="deleteCourse('${course}')">
                ✕
                </button>
            `;
            courseCard.addEventListener('click', () => openCourseEditor(course));
            courseList.appendChild(courseCard);
        });

        const overallMedian = calculateMedian(grades.map(g => g.grade));
        overallMedianDisplay.innerText = `${overallMedian}`;
    }

    function getGradesByCourse(course) {
        return grades.filter(grade => grade.subject === course).map(g => g.grade);
    }

    function calculateMedian(arr) {
        if (!arr.length) return 'N/A';
        let num = 0;
        arr.forEach(a => {
            num += a;
        });
        return (num / arr.length).toFixed(1);
    }

    window.deleteCourse = (courseName) => {
        const updatedCourses = dataStore.getCourses().filter(course => course !== courseName);
        dataStore.setCourses(updatedCourses);  // Update DataStore
        grades = grades.filter(grade => grade.subject !== courseName); 
        displayCourses();  
        setTimeout(() =>{
            gradeModal.classList.add('hidden');
            document.getElementById("main-container").classList.remove("animate-slope");
        },300)
    };

    function openCourseEditor(course) {
        currentCourse = course;
        courseGrades = grades.filter(g => g.subject === course);
        editorTitle.innerText = `${course}`;
        gradeModal.classList.remove('hidden');
        document.getElementById("main-container").classList.add("animate-slope");
        courseMedianDisplay.innerText = `${calculateMedian(courseGrades.map(g => g.grade))}`;
        renderGradeList();
    }

    function renderGradeList() {
        gradeList.innerHTML = '';
        courseGrades.forEach((grade, index) => {
            const gradeItem = document.createElement('div');
            gradeItem.classList.add('flex', 'justify-between', 'items-center', 'p-3', 'rounded', 'bg-gray-50', 'shadow');

            gradeItem.innerHTML = `
                <span class="text-gray-700">Grade ${index + 1}: ${grade.grade}</span>
                <div class="flex space-x-2">
                    <button class="text-blue-500 font-semibold" onclick="editGrade('${grade.id}')">Edit</button>
                    <button class="text-red-500 font-semibold" onclick="deleteGrade('${grade.id}')">Delete</button>
                </div>
            `;
            gradeList.appendChild(gradeItem);
        });
    }

    gradeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gradeValue = Number(gradeInput.value);

        if (gradeValue >= 0 && gradeValue <= 100) {
            const newGrade = dataStore.addGrade(currentCourse, gradeValue);
            grades.push(newGrade);
            courseGrades.push(newGrade);

            renderGradeList();
            displayCourses();
            openCourseEditor(currentCourse);
            gradeForm.reset();
        }
    });

    window.editGrade = (id) => {
        const grade = courseGrades.find(g => g.id === id);
        if (grade) {
            gradeInput.value = grade.grade;
            gradeForm.onsubmit = (e) => {
                e.preventDefault();
                grade.grade = Number(gradeInput.value);
                dataStore.saveGrades();
                displayCourses();
                openCourseEditor(currentCourse);
            };
        }
    };

    window.deleteGrade = (id) => {
        dataStore.deleteGrade(id);
        grades = grades.filter(g => g.id !== id);
        courseGrades = courseGrades.filter(g => g.id !== id);
        renderGradeList();
        displayCourses();
        openCourseEditor(currentCourse);
    };

    closeModalBtn.addEventListener('click', () => {
        gradeModal.classList.add('hidden');
        document.getElementById("main-container").classList.remove("animate-slope");
        gradeForm.reset();
    });

    displayCourses();
});
