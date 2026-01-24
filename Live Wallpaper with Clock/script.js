// DOM Elements
const timeElement = document.getElementById('time');
const hoursElement = document.querySelector('.hours');
const minutesElement = document.querySelector('.minutes');
const secondsElement = document.querySelector('.seconds');
const periodElement = document.getElementById('period');
const dayOfWeekElement = document.getElementById('dayOfWeek');
const fullDateElement = document.getElementById('fullDate');
const sunriseElement = document.getElementById('sunrise');
const timezoneElement = document.getElementById('timezone');
const temperatureElement = document.getElementById('temperature');

const themeToggle = document.getElementById('themeToggle');
const particleToggle = document.getElementById('particleToggle');
const wallpaperToggle = document.getElementById('wallpaperToggle');
const fullscreenToggle = document.getElementById('fullscreenToggle');
const wallpaperModal = document.getElementById('wallpaperModal');
const closeModal = document.getElementById('closeModal');
const wallpaperOptions = document.querySelectorAll('.wallpaper-option');

// State variables
let particlesActive = true;
let currentTheme = 'space';
let currentWallpaper = 'space';
let particles = [];

// Days and months for display
const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Initialize the clock
function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initialize particles
    if (particlesActive) {
        createParticles();
    }
    
    // Initialize temperature with a mock value
    updateTemperature();
    
    // Set up event listeners
    setupEventListeners();
}

// Update the clock display
function updateClock() {
    const now = new Date();
    
    // Get time components
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Format time with leading zeros
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    // Update time display
    hoursElement.textContent = formattedHours;
    minutesElement.textContent = formattedMinutes;
    secondsElement.textContent = formattedSeconds;
    
    // Update AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    periodElement.textContent = period;
    
    // Update day and date
    const dayOfWeek = daysOfWeek[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    dayOfWeekElement.textContent = dayOfWeek;
    fullDateElement.textContent = `${month} ${date}, ${year}`;
    
    // Update timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    timezoneElement.textContent = timezone.split('/')[1] || timezone;
    
    // Update sunrise time (mock data based on current time)
    updateSunriseTime(hours);
    
    // Add a subtle animation to the seconds
    secondsElement.style.transform = `scale(${1 + Math.sin(now.getTime() / 200) * 0.05})`;
}

// Update sunrise time (mock implementation)
function updateSunriseTime(currentHour) {
    // Simple logic to show a "sunrise" time
    let sunriseHour = 6;
    let sunriseMinute = 30;
    
    // Adjust slightly based on the hour
    if (currentHour > 12) {
        sunriseHour = 6 + Math.floor((currentHour - 12) / 2);
        sunriseMinute = (30 + currentHour * 3) % 60;
    }
    
    const period = sunriseHour >= 12 ? 'PM' : 'AM';
    const displayHour = sunriseHour % 12 || 12;
    const formattedMinutes = sunriseMinute.toString().padStart(2, '0');
    
    sunriseElement.textContent = `${displayHour}:${formattedMinutes} ${period}`;
}

// Update temperature (mock implementation)
function updateTemperature() {
    // Generate a random temperature between 15°C and 30°C
    const temp = Math.floor(Math.random() * 16) + 15;
    temperatureElement.textContent = `${temp}°C`;
    
    // Update temperature every minute
    setTimeout(updateTemperature, 60000);
}

// Create animated particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    particlesContainer.innerHTML = '';
    particles = [];
    
    // Create particles based on screen size
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size, position, and animation
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
        
        // Add CSS animation for floating
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% { transform: translate(0, 0) rotate(0deg); opacity: 0.7; }
                25% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) rotate(90deg); }
                50% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(180deg); opacity: 0.3; }
                75% { transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) rotate(270deg); }
                100% { transform: translate(0, 0) rotate(360deg); opacity: 0.7; }
            }
        `;
        
        document.head.appendChild(style);
        particlesContainer.appendChild(particle);
        particles.push(particle);
    }
}

// Toggle particles on/off
function toggleParticles() {
    particlesActive = !particlesActive;
    const particlesContainer = document.getElementById('particles');
    
    if (particlesActive) {
        createParticles();
        particleToggle.innerHTML = '<i class="fas fa-star"></i>';
        particleToggle.style.color = '#00f3ff';
    } else {
        particlesContainer.innerHTML = '';
        particleToggle.innerHTML = '<i class="far fa-star"></i>';
        particleToggle.style.color = '#aaa';
    }
}

// Change theme
function changeTheme() {
    const themes = ['nature', 'space', 'city', 'abstract'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    
    // Update body class
    document.body.className = '';
    document.body.classList.add(currentTheme);
    
    // Update theme toggle icon
    const themeIcons = ['fa-mountain', 'fa-star', 'fa-city', 'fa-palette'];
    themeToggle.innerHTML = `<i class="fas ${themeIcons[nextIndex]}"></i>`;
    
    // Recreate particles if active
    if (particlesActive) {
        createParticles();
    }
}

// Change wallpaper
function changeWallpaper(wallpaper) {
    currentWallpaper = wallpaper;
    document.body.className = '';
    document.body.classList.add(wallpaper);
    
    // Update active state in modal
    wallpaperOptions.forEach(option => {
        if (option.dataset.bg === wallpaper) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Update wallpaper toggle icon
    const wallpaperIcons = {
        'nature': 'fa-tree',
        'space': 'fa-star-and-crescent',
        'city': 'fa-building',
        'abstract': 'fa-shapes'
    };
    wallpaperToggle.innerHTML = `<i class="fas ${wallpaperIcons[wallpaper]}"></i>`;
    
    // Recreate particles if active
    if (particlesActive) {
        createParticles();
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', changeTheme);
    
    // Particle toggle
    particleToggle.addEventListener('click', toggleParticles);
    
    // Wallpaper toggle
    wallpaperToggle.addEventListener('click', () => {
        wallpaperModal.classList.add('active');
    });
    
    // Fullscreen toggle
    fullscreenToggle.addEventListener('click', toggleFullscreen);
    
    // Close modal
    closeModal.addEventListener('click', () => {
        wallpaperModal.classList.remove('active');
    });
    
    // Wallpaper selection
    wallpaperOptions.forEach(option => {
        option.addEventListener('click', () => {
            const wallpaper = option.dataset.bg;
            changeWallpaper(wallpaper);
        });
    });
    
    // Close modal on background click
    wallpaperModal.addEventListener('click', (e) => {
        if (e.target === wallpaperModal) {
            wallpaperModal.classList.remove('active');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (particlesActive) {
            createParticles();
        }
    });
    
    // Handle fullscreen change
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initClock);