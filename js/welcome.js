document.addEventListener("DOMContentLoaded", () => {
    
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
    const steps = document.querySelectorAll('[id^="step"]');

    let currentStep = 1;
    const totalSteps = 3;
    const selectedCourses = new Set();

    const commonCourses = [
        'Mathematik', 'Physik', 'Chemie', 'Biologie', 'Geschichte',
        'Deutsch', 'Informatik', 'Kunst', 'Musik'
    ];

    const selectedFeatures = new Set();

    const ANIMATION_CLASSES = {
        slideIn: 'slide-in',
        slideOut: 'slide-out',
        fadeIn: 'fade-in'
    };

    const updateProgress = () => {
        const progress = ((currentStep - 1)) * 100;
        progressBar.style.width = `${progress}%`;

        stepIndicators.forEach((indicator, index) => {
            if (index + 1 < currentStep) {
                indicator.classList.add('step-completed');
                indicator.classList.remove('step-active');
                indicator.innerHTML = '<i class="ri-check-line"></i>';
            } else if (index + 1 === currentStep) {
                indicator.classList.add('step-active');
                indicator.classList.remove('step-completed');
                indicator.textContent = index + 1;
            } else {
                indicator.classList.remove('step-active', 'step-completed');
                indicator.textContent = index + 1;
            }
        });

        prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        submitBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';

        steps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.remove('hidden');
                step.classList.add(ANIMATION_CLASSES.fadeIn);
            } else {
                step.classList.add('hidden');
                step.classList.remove(ANIMATION_CLASSES.fadeIn);
            }
        });
    };

    const renderCommonCourses = () => {
        commonCoursesContainer.innerHTML = commonCourses.map((course, index) => `
            <button type="button" 
                class="course-btn px-6 py-4 rounded-xl bg-white border-2 border-gray-200 
                       hover:border-indigo-500 hover:bg-indigo-50 text-gray-700 font-medium 
                       transition-all duration-300 micro-interaction ${selectedCourses.has(course) ? 'border-indigo-500 bg-indigo-50' : ''}"
                data-course="${course}"
                style="animation: fadeIn 0.3s ease-out forwards ${index * 0.1}s;">
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
                       border-2 border-indigo-200 text-indigo-700 ${ANIMATION_CLASSES.fadeIn}">
                ${course}
                <button type="button" class="remove-course p-2 rounded-full hover:bg-indigo-100 
                         text-indigo-500 hover:text-indigo-700 transition-colors duration-200" 
                         data-course="${course}">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `).join('');
    };

    const handleFeatureSelection = (featureCard) => {
        const feature = featureCard.dataset.feature;
        if (selectedFeatures.has(feature)) {
            selectedFeatures.delete(feature);
            featureCard.classList.remove('border-blue-400', 'bg-blue-50');
        } else {
            selectedFeatures.add(feature);
            featureCard.classList.add('border-blue-400', 'bg-blue-50');
        }
    };

    const validateStep = () => {
        switch (currentStep) {
            case 1:
                const name = userNameInput.value.trim();
                if (name.length === 0) {
                    showInputError(userNameInput);
                    return false;
                }
                return true;
            case 2:
                return selectedCourses.size > 0;
            case 3:
                return selectedFeatures.size > 0;
            default:
                return false;
        }
    };

    const showInputError = (input) => {
        input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-100');
        input.classList.add('animate-shake');
        setTimeout(() => {
            input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-100');
            input.classList.remove('animate-shake');
        }, 2000);
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

    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', () => handleFeatureSelection(card));
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
        }
    });

    welcomeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        try {
            const userData = {
                userName: userNameInput.value.trim(),
                courses: Array.from(selectedCourses),
                features: Array.from(selectedFeatures)
            };
            localStorage.setItem('userProfile', JSON.stringify(userData));
            
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    });

    customCourseInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomCourseBtn.click();
        }
    });

    renderCommonCourses();
    renderSelectedCourses();
    updateProgress();
});