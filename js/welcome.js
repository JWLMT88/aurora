
document.addEventListener("DOMContentLoaded", () => {
    const dataStore = new DataStore();
    const welcomeForm = document.getElementById('welcomeForm');
    const userNameInput = document.getElementById('userName');
    const commonCoursesContainer = document.getElementById('commonCourses');
    const customCourseInput = document.getElementById('customCourse');
    const addCustomCourseBtn = document.getElementById('addCustomCourse');
    const selectedCoursesContainer = document.getElementById('selectedCourses');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressBar = document.querySelector('.progress-bar');
    const stepIndicators = document.querySelectorAll('.step-indicator');

    let currentStep = 1;
    const totalSteps = 2;

    const commonCourses = [
        'Mathematik', 'Physik', 'Chemie', 'Biologie', 'Geschichte',
        'Deutsch', 'Informatik', 'Kunst', 'Musik', 'Biologie'
    ];

    const selectedCourses = new Set();

    const updateProgress = () => {
        const progress = ((currentStep - 1) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;

        stepIndicators.forEach((indicator, index) => {
            if (index + 1 < currentStep) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
                indicator.innerHTML = '<i class="ri-check-line"></i>';
            } else if (index + 1 === currentStep) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
                indicator.textContent = index + 1;
            } else {
                indicator.classList.remove('active', 'completed');
                indicator.textContent = index + 1;
            }
        });

        prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        submitBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';
        
        if(currentStep==2){
            document.getElementById('step1').classList.add("hidden")
            document.getElementById('step2').classList.remove("hidden")
        }
        else{
            document.getElementById('step1').classList.remove("hidden")
            document.getElementById('step2').classList.add("hidden")
        }
    };

    const renderCommonCourses = () => {
        commonCoursesContainer.innerHTML = commonCourses.map((course, index) => `
            <button type="button" 
                class="course-btn px-6 py-4 rounded-xl bg-white border-2 border-gray-200 
                       hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 font-medium 
                       transition-all duration-300 micro-interaction"
                data-course="${course}"
                style="animation: slideIn 0.3s ease-out forwards ${index * 0.1}s;">
                ${course}
            </button>
        `).join('');
    };

    const renderSelectedCourses = () => {
        if (selectedCourses.size === 0) {
            selectedCoursesContainer.innerHTML = `
                <div class="text-gray-500 text-center py-6">
                    No courses selected yet
                </div>
            `;
            return;
        }
        selectedCoursesContainer.innerHTML = Array.from(selectedCourses).map(course => `
            <div class="flex items-center justify-between px-6 py-3 rounded-xl bg-indigo-50 
                     border-2 border-indigo-200 text-indigo-700 animate-slide-in micro-interaction">
                ${course}
                <button type="button" class="remove-course p-2 rounded-full hover:bg-indigo-100 
                         text-indigo-500 hover:text-indigo-700 transition-colors duration-200" 
                         data-course="${course}">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `).join('');
    };

    const validateStep = () => {
        if (currentStep === 1) {
            return userNameInput.value.trim().length > 0;
        } else if (currentStep === 2) {
            return selectedCourses.size > 0;
        }
        return false;
    };

    commonCoursesContainer.addEventListener('click', (e) => {
        const courseBtn = e.target.closest('button[data-course]');
        if (!courseBtn) return;

        const course = courseBtn.dataset.course;
        if (selectedCourses.has(course)) {
            selectedCourses.delete(course);
            courseBtn.classList.remove('border-indigo-500', 'bg-indigo-50');
        } else {
            selectedCourses.add(course);
            courseBtn.classList.add('border-indigo-500', 'bg-indigo-50');
        }
        renderSelectedCourses();
    });

    selectedCoursesContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-course');
        if (!removeBtn) return;

        const course = removeBtn.dataset.course;
        selectedCourses.delete(course);
        renderSelectedCourses();
        const courseBtn = commonCoursesContainer.querySelector(`button[data-course="${course}"]`);
        if (courseBtn) {
            courseBtn.classList.remove('border-indigo-500', 'bg-indigo-50');
        }
    });

    addCustomCourseBtn.addEventListener('click', () => {
        const courseName = customCourseInput.value.trim();
        if (courseName && !selectedCourses.has(courseName)) {
            selectedCourses.add(courseName);
            renderSelectedCourses();
            customCourseInput.value = '';
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateProgress();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (validateStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateProgress();
            }
        } else {
            if (currentStep === 1) {
                userNameInput.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-100');
                setTimeout(() => {
                    userNameInput.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-100');
                }, 2000);
            }
        }
    });

    welcomeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        try {
            dataStore.setUserName(userNameInput.value.trim());
            dataStore.setCourses(Array.from(selectedCourses));
            window.location.href = 'index.html';
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    });

    renderCommonCourses();
    renderSelectedCourses();
    updateProgress();

})