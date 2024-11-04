document.addEventListener("DOMContentLoaded", () => {
    const dataStore = new DataStore();
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    const currentYearElement = document.getElementById('currentYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const addEventBtn = document.getElementById('addEventBtn');
    const eventDialog = document.getElementById('eventDialog');
    const eventDetailsDialog = document.getElementById('eventDetailsDialog');
    const eventForm = document.getElementById('eventForm');
    const eventTitle = document.getElementById('eventTitle');
    const eventDate = document.getElementById('eventDate');
    const eventTime = document.getElementById('eventTime');
    const eventCourse = document.getElementById('eventCourse');
    const eventPriority = document.getElementById('eventPriority');
    const eventDescription = document.getElementById('eventDescription');
    const cancelEventBtn = document.getElementById('cancelEventBtn');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    const editEventBtn = document.getElementById('editEventBtn');
    const todayBtn = document.getElementById('todayBtn');
    const weekViewBtn = document.getElementById('weekViewBtn');
    const monthViewBtn = document.getElementById('monthViewBtn');

    let currentDate = new Date();
    let currentView = 'month';
    let selectedEventId = null;

    const DateTime = luxon.DateTime;

    const renderCalendar = () => {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        currentMonthElement.textContent = currentDate.toLocaleString('default', { month: 'long' });
        currentYearElement.textContent = currentDate.getFullYear();

        let calendarHTML = `
            <div class="font-semibold text-gray-600 text-center py-2">Sun</div>
            <div class="font-semibold text-gray-600 text-center py-2;">Mon</div>
            <div class="font-semibold text-gray-600 text-center py-2">Tue</div>
            <div class="font-semibold text-gray-600 text-center py-2">Wed</div>
            <div class="font-semibold text-gray-600 text-center py-2">Thu</div>
            <div class="font-semibold text-gray-600 text-center py-2">Fri</div>
            <div class="font-semibold text-gray-600 text-center py-2">Sat</div>
        `;

        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day empty p-2 border border-gray-200"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const events = dataStore.getEvents().filter(event => {
                const eventDate = new Date(event.title.date);
                return eventDate.toDateString() === date.toDateString();
            });

            const isToday = date.toDateString() === new Date().toDateString();
            calendarHTML += `
                <div class="calendar-day p-2 border border-gray-200 ${isToday ? 'today' : ''}" data-date="${date.toISOString().split('T')[0]}">
                    <div class="day-number font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}">${day}</div>
                    <div class="events-container mt-1">
                        ${events.map(event => `
                            <div class="event event-priority-${event.title.priority || 'low'} text-xs " data-id="${event.id}">
                                <div class="event-title font-medium truncate" style="color: #000000;">${event.title.title}</div>
                                <div class="event-time text-gray-500">${DateTime.fromISO(event.title.date).toLocaleString(DateTime.TIME_SIMPLE)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        calendarGrid.innerHTML = calendarHTML;
    };

    const showEventDialog = (date = null) => {
        eventDialog.classList.remove('hidden');
        document.getElementById("main-container").classList.add("animate-slope");
        if (date) {
            eventDate.value = date;
        }
        populateEventCourseSelect();
    };

    const hideEventDialog = () => {
        eventDialog.classList.add('hidden');
        document.getElementById("main-container").classList.remove("animate-slope");
        eventForm.reset();
        selectedEventId = null;
    };

    const showEventDetailsDialog = (event) => {
        selectedEventId = event.id;
        const detailsTitle = document.getElementById('detailsTitle');
        const detailsDateTime = document.getElementById('detailsDateTime');
        const detailsCourse = document.getElementById('detailsCourse');
        const detailsPriority = document.getElementById('detailsPriority');
        const detailsDescription = document.getElementById('detailsDescription');

        detailsTitle.textContent = event.title.title;
        detailsDateTime.textContent = DateTime.fromISO(event.title.date).toLocaleString(DateTime.DATETIME_MED);
        detailsCourse.textContent = event.title.course;
        detailsPriority.textContent = event.title.priority.charAt(0).toUpperCase() + event.title.priority.slice(1);
        detailsDescription.textContent = event.title.description || 'No description provided';

        document.getElementById("main-container").classList.add("animate-slope");
        eventDetailsDialog.classList.remove('hidden');
    };

    const hideEventDetailsDialog = () => {
        
        document.getElementById("main-container").classList.remove("animate-slope");
        eventDetailsDialog.classList.add('hidden');
        selectedEventId = null;
    };

    const populateEventCourseSelect = () => {
        const courses = dataStore.getCourses();
        eventCourse.innerHTML = courses.map(course =>
            `<option value="${course}">${course}</option>`
        ).join('');
    };

    const addEvent = (e) => {
        e.preventDefault();
        const title = eventTitle.value.trim();
        const date = new Date(`${eventDate.value}T${eventTime.value}`);
        const course = eventCourse.value;
        const priority = eventPriority.value;
        const description = eventDescription.value.trim();

        if (title && date) {
            if (selectedEventId) {
                dataStore.updateEvent(selectedEventId, {
                    title,
                    date,
                    course,
                    priority,
                    description
                });
            } else {
                dataStore.addEvent({
                    title,
                    date,
                    course,
                    priority,
                    description
                });
            }
            hideEventDialog();
            renderCalendar();
        }
    };

    const deleteEvent = () => {
        if (selectedEventId && confirm('Are you sure you want to delete this event?')) {
            dataStore.deleteEvent(selectedEventId);
            hideEventDetailsDialog();
            renderCalendar();
        }
    };

    const editEvent = () => {
        const event = dataStore.getEvent(selectedEventId);
        if (event) {
            eventTitle.value = event.title.title;
            eventDate.value = event.title.date.split('T')[0];
            eventTime.value = event.title.date.split('T')[1].substring(0, 5);
            eventCourse.value = event.title.course;
            eventPriority.value = event.title.priority;
            eventDescription.value = event.title.description || '';

            hideEventDetailsDialog();
            showEventDialog();
        }
    };

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });

    addEventBtn.addEventListener('click', () => showEventDialog(new Date().toISOString().split('T')[0]));
    cancelEventBtn.addEventListener('click', hideEventDialog);
    closeDetailsBtn.addEventListener('click', hideEventDetailsDialog);
    deleteEventBtn.addEventListener('click', deleteEvent);
    editEventBtn.addEventListener('click', editEvent);
    eventForm.addEventListener('submit', addEvent);

    calendarGrid.addEventListener('click', (e) => {
        const calendarDay = e.target.closest('.calendar-day');
        const eventElement = e.target.closest('.event');

        if (calendarDay && !calendarDay.classList.contains('empty') && !eventElement) {
            const date = calendarDay.dataset.date;
            showEventDialog(date);
        }

        if (eventElement) {
            e.stopPropagation();
            const eventId = eventElement.dataset.id;
            const event = dataStore.getEvent(eventId);
            if (event) {
                showEventDetailsDialog(event);
            }
        }
    });
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
    70% { transform: scale(0.9); }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .calendar-day {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .calendar-day:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 1;
  }

  .calendar-day.animate-in {
    animation: scaleIn 0.3s ease forwards;
  }

  .event {
    transition: all 0.2s ease;
    animation: slideIn 0.3s ease forwards;
  }

  .event:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .event-priority-high {
    animation: bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .today {
    position: relative;
    overflow: hidden;
  }

  .today::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2s infinite;
  }

  .dialog-overlay {
    animation: fadeIn 0.2s ease forwards;
  }

  .dialog-content {
    animation: slideIn 0.3s ease forwards;
  }

  .month-enter {
    animation: slideIn 0.3s ease forwards;
  }

  .month-exit {
    animation: slideOut 0.3s ease forwards;
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(20px);
      opacity: 0;
    }
  }
`;
    document.head.appendChild(styleSheet);

    // Enhanced animation functions
    const animateCalendarDays = () => {
        const days = document.querySelectorAll('.calendar-day:not(.empty)');
        days.forEach((day, index) => {
            day.style.opacity = '0';
            day.style.animation = 'none';
            setTimeout(() => {
                day.style.animation = `scaleIn 0.3s ease forwards ${index * 0.03}s`;
            }, 50);
        });
    };

    const animateMonthTransition = (direction) => {
        const calendarGrid = document.getElementById('calendarGrid');
        const oldContent = calendarGrid.innerHTML;
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.height = calendarGrid.offsetHeight + 'px';

        const oldMonth = document.createElement('div');
        oldMonth.innerHTML = oldContent;
        oldMonth.style.position = 'absolute';
        oldMonth.style.width = '100%';
        oldMonth.style.animation = `slideOut 0.3s ease forwards`;
        oldMonth.style.transform = 'translateX(' + (direction === 'next' ? '-' : '') + '100%)';

        wrapper.appendChild(oldMonth);
        calendarGrid.innerHTML = '';
        calendarGrid.appendChild(wrapper);

        setTimeout(() => {
            renderCalendar();
            animateCalendarDays();
        }, 300);
    };

    const enhanceEventHandlers = () => {
        // Enhanced show dialog animation
        const showEventDialog = (date = null) => {
            eventDialog.classList.remove('hidden');
            eventDialog.classList.add('dialog-overlay');
            const dialogContent = eventDialog.querySelector('.dialog-content');
            dialogContent.style.animation = 'slideIn 0.3s ease forwards';
            if (date) {
                eventDate.value = date;
            }
            populateEventCourseSelect();
        };

        // Enhanced event creation animation
        const addEventWithAnimation = (element) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(-10px)';
            element.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 50);
        };

        // Enhanced month navigation
        prevMonthBtn.addEventListener('click', () => {
            animateMonthTransition('prev');
        });

        nextMonthBtn.addEventListener('click', () => {
            animateMonthTransition('next');
        });

        // Enhance today button animation
        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
            animateMonthTransition('today');
        });
    };


    // Add smooth hover effects for interactive elements
    const addHoverEffects = () => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.transition = 'all 0.2s ease';
            button.addEventListener('mouseover', () => {
                button.style.transform = 'translateY(-1px)';
            });
            button.addEventListener('mouseout', () => {
                button.style.transform = 'translateY(0)';
            });
        });
    };

    // Add loading animation
    const addLoadingState = (element) => {
        element.classList.add('loading');
        element.style.position = 'relative';
        element.style.overflow = 'hidden';

        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2s infinite;
  `;

        element.appendChild(shimmer);
        return () => {
            element.classList.remove('loading');
            shimmer.remove();
        };
    };

    const enhanceEventPriority = () => {
        const events = document.querySelectorAll('.event');
        events.forEach(event => {
            const priority = event.dataset.priority;
            if (priority === 'high') {
                event.style.animation = 'bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }
        });
    };

    // Initialize calendar
    renderCalendar();
    enhanceEventHandlers();
    enhanceEventPriority()
    animateCalendarDays();
})

