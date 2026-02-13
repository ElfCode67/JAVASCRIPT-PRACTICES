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
const locationElement = document.getElementById('location');

// Control buttons
const themeToggle = document.getElementById('themeToggle');
const particleToggle = document.getElementById('particleToggle');
const videoToggle = document.getElementById('videoToggle');
const wallpaperToggle = document.getElementById('wallpaperToggle');
const settingsToggle = document.getElementById('settingsToggle');
const fullscreenToggle = document.getElementById('fullscreenToggle');

// UI Elements
const instructionBadge = document.getElementById('instructionBadge');
const tipsOverlay = document.getElementById('tipsOverlay');
const hideTips = document.getElementById('hideTips');

// Modals
const wallpaperModal = document.getElementById('wallpaperModal');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const wallpaperOptions = document.querySelectorAll('.wallpaper-option');

// Settings elements
const clockFormat = document.getElementById('clockFormat');
const dateFormat = document.getElementById('dateFormat');
const particleDensity = document.getElementById('particleDensity');
const animationSpeed = document.getElementById('animationSpeed');
const weatherUnit = document.getElementById('weatherUnit');
const autoTheme = document.getElementById('autoTheme');
const densityValue = document.getElementById('densityValue');
const speedValue = document.getElementById('speedValue');

// State variables
let particlesActive = true;
let videoActive = false;
let currentTheme = 'space';
let currentWallpaper = 'space';
let particles = [];
let mouseTrailActive = true;
let weatherData = null;
let use12Hour = true;
let currentDateFormat = 'YYYY-MM-DD';
let particleDensityValue = 50;
let animationSpeedValue = 1;
let weatherUnitValue = 'celsius';
let autoThemeEnabled = true;

// Days and months for display
const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Video backgrounds (using free stock videos)
const videoBackgrounds = {
    nature: 'https://player.vimeo.com/external/370331553.sd.mp4?s=9f0c85e5a39a9b5b2a8f7c5b3a5b8a7f6e5d4c3b&profile_id=165',
    space: 'https://player.vimeo.com/external/320912048.sd.mp4?s=6c9b5a3d2e1f4a7b8c9d0e1f2a3b4c5d6e7f8a9b&profile_id=165',
    city: 'https://player.vimeo.com/external/442259303.sd.mp4?s=8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b&profile_id=165',
    abstract: 'https://player.vimeo.com/external/434215526.sd.mp4?s=5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b&profile_id=165'
};

// Initialize the application
function init() {
    loadSettings();
    updateClock();
    setInterval(updateClock, 1000);
    
    if (particlesActive) {
        createParticles();
    }
    
    initMouseTrail();
    initAudioVisualizer();
    fetchWeather();
    setupEventListeners();
    
    setInterval(updateBasedOnTime, 60000);
    updateBasedOnTime();
    
    // Show welcome message on first visit
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(showWelcomeMessage, 500);
        localStorage.setItem('welcomeShown', 'true');
    }
    
    // Auto-hide tips after 8 seconds
    setTimeout(() => {
        if (tipsOverlay.classList.contains('show')) {
            tipsOverlay.classList.remove('show');
        }
    }, 8000);
    
    // Update range displays
    updateRangeDisplays();
}

// Show welcome message
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <h2><i class="fas fa-clock"></i> Wallpaper Clock</h2>
        <p>Welcome! Your interactive desktop clock is ready.</p>
        <ul class="features-list">
            <li><i class="fas fa-check-circle"></i> Live weather from your location</li>
            <li><i class="fas fa-check-circle"></i> Interactive particles that follow mouse</li>
            <li><i class="fas fa-check-circle"></i> Video backgrounds for dynamic scenes</li>
            <li><i class="fas fa-check-circle"></i> Auto day/night theme adjustment</li>
            <li><i class="fas fa-check-circle"></i> Multiple wallpaper styles</li>
        </ul>
        <p class="small">Click any icon below to customize your experience</p>
        <button id="closeWelcome">Get Started</button>
    `;
    document.body.appendChild(welcomeDiv);
    
    document.getElementById('closeWelcome').addEventListener('click', () => {
        welcomeDiv.remove();
        tipsOverlay.classList.add('show');
    });
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('clockSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        use12Hour = settings.use12Hour ?? true;
        currentDateFormat = settings.dateFormat || 'YYYY-MM-DD';
        particleDensityValue = settings.particleDensity || 50;
        animationSpeedValue = settings.animationSpeed || 1;
        weatherUnitValue = settings.weatherUnit || 'celsius';
        autoThemeEnabled = settings.autoTheme ?? true;
        
        // Update UI
        clockFormat.value = use12Hour ? '12h' : '24h';
        dateFormat.value = currentDateFormat;
        particleDensity.value = particleDensityValue;
        animationSpeed.value = animationSpeedValue;
        weatherUnit.value = weatherUnitValue;
        autoTheme.checked = autoThemeEnabled;
        
        // Update CSS variables
        document.documentElement.style.setProperty('--animation-speed', animationSpeedValue);
        document.documentElement.style.setProperty('--particle-density', particleDensityValue);
    }
}

// Update range display values
function updateRangeDisplays() {
    if (densityValue) {
        densityValue.textContent = particleDensityValue + '%';
    }
    if (speedValue) {
        speedValue.textContent = animationSpeedValue + 'x';
    }
    
    particleDensity.addEventListener('input', (e) => {
        densityValue.textContent = e.target.value + '%';
    });
    
    animationSpeed.addEventListener('input', (e) => {
        speedValue.textContent = parseFloat(e.target.value).toFixed(1) + 'x';
    });
}

// Save settings to localStorage
function saveSettingsToStorage() {
    const settings = {
        use12Hour,
        dateFormat: currentDateFormat,
        particleDensity: particleDensityValue,
        animationSpeed: animationSpeedValue,
        weatherUnit: weatherUnitValue,
        autoTheme: autoThemeEnabled
    };
    localStorage.setItem('clockSettings', JSON.stringify(settings));
}

// Update the clock display
function updateClock() {
    const now = new Date();
    
    // Get time components
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    let displayHours = hours;
    let period = '';
    
    if (use12Hour) {
        period = hours >= 12 ? 'PM' : 'AM';
        displayHours = hours % 12 || 12;
    }
    
    // Format time with leading zeros
    const formattedHours = displayHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    // Animate number changes
    animateNumberChange(secondsElement, formattedSeconds);
    
    if (minutesElement.textContent !== formattedMinutes) {
        animateNumberChange(minutesElement, formattedMinutes);
    }
    
    if (hoursElement.textContent !== formattedHours) {
        animateNumberChange(hoursElement, formattedHours);
    }
    
    // Update AM/PM
    periodElement.textContent = period;
    periodElement.style.display = use12Hour ? 'block' : 'none';
    
    // Update day and date
    const dayOfWeek = daysOfWeek[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    dayOfWeekElement.textContent = dayOfWeek;
    
    // Format date based on settings
    let formattedDate;
    switch (currentDateFormat) {
        case 'MM/DD/YYYY':
            formattedDate = `${month} ${date}, ${year}`;
            break;
        case 'DD/MM/YYYY':
            formattedDate = `${date} ${month}, ${year}`;
            break;
        default:
            formattedDate = `${year}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    }
    fullDateElement.textContent = formattedDate;
    
    // Update timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    timezoneElement.textContent = timezone.split('/')[1] || timezone;
    
    // Update sunrise time
    updateSunriseTime(hours);
}

// Animate number changes
function animateNumberChange(element, newValue) {
    element.classList.add('changing');
    element.textContent = newValue;
    setTimeout(() => {
        element.classList.remove('changing');
    }, 300 / animationSpeedValue);
}

// Update sunrise time
function updateSunriseTime(currentHour) {
    let sunriseHour = 6;
    let sunriseMinute = 30;
    
    if (currentHour > 12) {
        sunriseHour = 6 + Math.floor((currentHour - 12) / 2);
        sunriseMinute = (30 + currentHour * 3) % 60;
    }
    
    const period = sunriseHour >= 12 ? 'PM' : 'AM';
    const displayHour = sunriseHour % 12 || 12;
    const formattedMinutes = sunriseMinute.toString().padStart(2, '0');
    
    sunriseElement.textContent = `${displayHour}:${formattedMinutes} ${period}`;
}

// Fetch weather data
async function fetchWeather() {
    // Add loading state
    temperatureElement.parentElement.classList.add('loading');
    
    try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
        );
        
        const data = await response.json();
        if (data.current_weather) {
            weatherData = data.current_weather;
            updateTemperature();
            updateWeatherIcon(data.current_weather.weathercode);
            temperatureElement.parentElement.classList.remove('loading');
        }
        
        // Get location name using reverse geocoding
        const locationResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        const locationData = await locationResponse.json();
        locationElement.textContent = locationData.address?.city || 
                                     locationData.address?.town || 
                                     locationData.address?.village || 'Unknown';
    } catch (error) {
        console.log('Weather fetch failed, using mock data');
        updateMockTemperature();
        locationElement.textContent = 'Unknown';
        temperatureElement.parentElement.classList.remove('loading');
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function updateTemperature() {
    if (weatherData) {
        let temp = weatherData.temperature;
        if (weatherUnitValue === 'fahrenheit') {
            temp = (temp * 9/5) + 32;
        }
        temperatureElement.textContent = `${Math.round(temp)}°${weatherUnitValue === 'celsius' ? 'C' : 'F'}`;
    }
}

function updateMockTemperature() {
    const temp = Math.floor(Math.random() * 16) + 15;
    temperatureElement.textContent = `${temp}°C`;
    setTimeout(updateMockTemperature, 60000);
}

function updateWeatherIcon(code) {
    const iconElement = document.querySelector('#weatherInfo i');
    // Map weather codes to icons
    if (code === 0) { // Clear sky
        iconElement.className = 'fas fa-sun';
    } else if (code < 3) { // Partly cloudy
        iconElement.className = 'fas fa-cloud-sun';
    } else if (code < 50) { // Cloudy
        iconElement.className = 'fas fa-cloud';
    } else if (code < 70) { // Rain
        iconElement.className = 'fas fa-cloud-rain';
    } else { // Snow/Storm
        iconElement.className = 'fas fa-cloud-showers-heavy';
    }
}

// Create animated particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    particlesContainer.innerHTML = '';
    particles = [];
    
    // Calculate particle count based on density setting
    const baseCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
    const particleCount = Math.floor(baseCount * (particleDensityValue / 50));
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = (Math.random() * 20 + 10) / animationSpeedValue;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
        
        particlesContainer.appendChild(particle);
        particles.push(particle);
    }
}

// Initialize mouse trail
function initMouseTrail() {
    const trail = document.getElementById('mouseTrail');
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateTrail() {
        if (mouseTrailActive) {
            // Smooth follow
            trailX += (mouseX - trailX) * 0.1;
            trailY += (mouseY - trailY) * 0.1;
            
            trail.style.left = trailX - 10 + 'px';
            trail.style.top = trailY - 10 + 'px';
            
            // Interact with particles
            if (particlesActive) {
                particles.forEach(particle => {
                    const rect = particle.getBoundingClientRect();
                    const particleX = rect.left + rect.width / 2;
                    const particleY = rect.top + rect.height / 2;
                    
                    const dx = mouseX - particleX;
                    const dy = mouseY - particleY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        const angle = Math.atan2(dy, dx);
                        const force = (100 - distance) / 100;
                        const moveX = Math.cos(angle) * force * 20;
                        const moveY = Math.sin(angle) * force * 20;
                        
                        particle.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
                    } else {
                        particle.style.transform = '';
                    }
                });
            }
        }
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
}

// Initialize audio visualizer
function initAudioVisualizer() {
    const visualizer = document.getElementById('audioVisualizer');
    
    // Create bars
    for (let i = 0; i < 50; i++) {
        const bar = document.createElement('div');
        bar.classList.add('audio-bar');
        bar.style.animationDelay = `${i * 0.02}s`;
        visualizer.appendChild(bar);
    }
    
    // Simulate audio input
    setInterval(() => {
        if (document.hasFocus()) {
            const bars = document.querySelectorAll('.audio-bar');
            bars.forEach(bar => {
                const height = 20 + Math.random() * 60;
                bar.style.height = `${height}px`;
            });
        }
    }, 100);
}

// Update based on time of day
function updateBasedOnTime() {
    if (!autoThemeEnabled) return;
    
    const hour = new Date().getHours();
    
    // Adjust brightness
    const brightness = hour >= 6 && hour <= 18 ? 1 : 0.7;
    document.documentElement.style.setProperty('--brightness', brightness);
    
    // Change color scheme based on time
    let primaryColor;
    if (hour >= 5 && hour < 8) {
        // Sunrise
        primaryColor = '#ff7e5f';
    } else if (hour >= 8 && hour < 17) {
        // Day
        primaryColor = '#00f3ff';
    } else if (hour >= 17 && hour < 20) {
        // Sunset
        primaryColor = '#feb47b';
    } else {
        // Night
        primaryColor = '#9b59b6';
    }
    
    document.documentElement.style.setProperty('--primary-color', primaryColor);
}

// Toggle particles
function toggleParticles() {
    particlesActive = !particlesActive;
    const particlesContainer = document.getElementById('particles');
    
    if (particlesActive) {
        createParticles();
        particleToggle.innerHTML = '<i class="fas fa-star"></i>';
        particleToggle.style.color = 'var(--primary-color)';
    } else {
        particlesContainer.innerHTML = '';
        particleToggle.innerHTML = '<i class="far fa-star"></i>';
        particleToggle.style.color = '#aaa';
    }
}

// Toggle video background
function toggleVideo() {
    videoActive = !videoActive;
    const video = document.querySelector('.background-video');
    
    if (videoActive && videoBackgrounds[currentWallpaper]) {
        video.style.display = 'block';
        video.src = videoBackgrounds[currentWallpaper];
        video.play().catch(e => console.log('Video playback failed:', e));
        document.body.style.background = 'none';
        videoToggle.innerHTML = '<i class="fas fa-image"></i>';
    } else {
        video.style.display = 'none';
        video.pause();
        document.body.className = currentWallpaper;
        videoToggle.innerHTML = '<i class="fas fa-video"></i>';
    }
}

// Change theme
function changeTheme() {
    const themes = ['nature', 'space', 'city', 'abstract'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    
    document.body.className = '';
    document.body.classList.add(currentTheme);
    
    const themeIcons = ['fa-tree', 'fa-star', 'fa-building', 'fa-palette'];
    themeToggle.innerHTML = `<i class="fas ${themeIcons[nextIndex]}"></i>`;
    
    if (particlesActive) {
        createParticles();
    }
}

// Change wallpaper
function changeWallpaper(wallpaper) {
    currentWallpaper = wallpaper;
    
    if (videoActive) {
        const video = document.querySelector('.background-video');
        video.src = videoBackgrounds[wallpaper];
        video.play().catch(e => console.log('Video playback failed:', e));
    } else {
        document.body.className = '';
        document.body.classList.add(wallpaper);
    }
    
    wallpaperOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.bg === wallpaper);
    });
    
    const wallpaperIcons = {
        'nature': 'fa-tree',
        'space': 'fa-star',
        'city': 'fa-building',
        'abstract': 'fa-shapes'
    };
    wallpaperToggle.innerHTML = `<i class="fas ${wallpaperIcons[wallpaper]}"></i>`;
    
    if (particlesActive) {
        createParticles();
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Control buttons
    themeToggle.addEventListener('click', changeTheme);
    particleToggle.addEventListener('click', toggleParticles);
    videoToggle.addEventListener('click', toggleVideo);
    
    wallpaperToggle.addEventListener('click', () => {
        wallpaperModal.classList.add('active');
    });
    
    settingsToggle.addEventListener('click', () => {
        settingsModal.classList.add('active');
    });
    
    fullscreenToggle.addEventListener('click', toggleFullscreen);
    
    // Instruction badge
    instructionBadge.addEventListener('click', () => {
        tipsOverlay.classList.toggle('show');
    });
    
    // Hide tips
    hideTips.addEventListener('click', () => {
        tipsOverlay.classList.remove('show');
    });
    
    // Close tips when clicking outside
    document.addEventListener('click', (e) => {
        if (tipsOverlay.classList.contains('show') && 
            !tipsOverlay.contains(e.target) && 
            !instructionBadge.contains(e.target)) {
            tipsOverlay.classList.remove('show');
        }
    });
    
    // Modal close buttons
    closeModal.addEventListener('click', () => {
        wallpaperModal.classList.remove('active');
    });
    
    closeSettings.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });
    
    // Save settings
    saveSettings.addEventListener('click', () => {
        use12Hour = clockFormat.value === '12h';
        currentDateFormat = dateFormat.value;
        particleDensityValue = parseInt(particleDensity.value);
        animationSpeedValue = parseFloat(animationSpeed.value);
        weatherUnitValue = weatherUnit.value;
        autoThemeEnabled = autoTheme.checked;
        
        document.documentElement.style.setProperty('--animation-speed', animationSpeedValue);
        
        saveSettingsToStorage();
        
        if (particlesActive) {
            createParticles();
        }
        
        if (weatherData) {
            updateTemperature();
        }
        
        updateClock();
        settingsModal.classList.remove('active');
    });
    
    // Wallpaper selection
    wallpaperOptions.forEach(option => {
        option.addEventListener('click', () => {
            changeWallpaper(option.dataset.bg);
            wallpaperModal.classList.remove('active');
        });
    });
    
    // Close modals on background click
    [wallpaperModal, settingsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        if (particlesActive) {
            createParticles();
        }
    });
    
    // Fullscreen change
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);