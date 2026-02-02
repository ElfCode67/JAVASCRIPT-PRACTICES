// DOM Elements
const dogImage = document.getElementById('dogImage');
const placeholder = document.getElementById('placeholder');
const fetchBtn = document.getElementById('fetchBtn');
const loader = document.getElementById('loader');

// API URL
const API_URL = 'https://dog.ceo/api/breeds/image/random';

// Function to fetch a random dog image
async function fetchRandomDog() {
    try {
        // Show loader and hide current image
        loader.style.display = 'block';
        dogImage.style.display = 'none';
        placeholder.style.display = 'none';
        
        // Disable button during fetch
        fetchBtn.disabled = true;
        fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
        
        // Fetch data from API
        const response = await fetch(API_URL);
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Wait a moment so we can see the loader (optional)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update image source
        dogImage.src = data.message;
        
        // When image loads, show it
        dogImage.onload = () => {
            dogImage.style.display = 'block';
            loader.style.display = 'none';
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = '<i class="fas fa-bone"></i> Fetch Random Dog';
        };
        
        // Handle image loading error
        dogImage.onerror = () => {
            throw new Error('Failed to load image');
        };
        
    } catch (error) {
        // Handle errors
        console.error('Error fetching dog:', error);
        
        // Show error message
        placeholder.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
            <p>Failed to fetch dog image</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
        `;
        placeholder.style.display = 'flex';
        placeholder.style.flexDirection = 'column';
        
        // Reset UI
        dogImage.style.display = 'none';
        loader.style.display = 'none';
        fetchBtn.disabled = false;
        fetchBtn.innerHTML = '<i class="fas fa-bone"></i> Try Again';
    }
}

// Event listener for button click
fetchBtn.addEventListener('click', fetchRandomDog);

// Fetch first dog when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Small delay so user can see the initial state
    setTimeout(fetchRandomDog, 500);
});