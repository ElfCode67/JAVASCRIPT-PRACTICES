// API Service for Open Library
export class ApiService {
    static async searchBooks(query, limit = 10) {
        try {
            showLoading('Searching Open Library...');
            
            const response = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
            );
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            hideLoading();
            
            // Process and normalize the data
            return data.docs
                .filter(doc => doc.isbn && doc.isbn[0]) // Only include books with ISBN
                .map(doc => ({
                    title: doc.title || 'Unknown Title',
                    author: doc.author_name?.[0] || 'Unknown Author',
                    isbn: doc.isbn[0],
                    year: doc.first_publish_year || new Date().getFullYear(),
                    coverUrl: doc.cover_i 
                        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                        : null,
                    publisher: doc.publisher?.[0] || '',
                    pages: doc.number_of_pages_median || 0
                }));
                
        } catch (error) {
            hideLoading();
            console.error('API Search Error:', error);
            showNotification('error', 'API Error', 'Failed to search Open Library');
            return [];
        }
    }
    
    static async getBookByIsbn(isbn) {
        try {
            const response = await fetch(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
            );
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            const bookKey = `ISBN:${isbn}`;
            
            if (data[bookKey]) {
                const bookData = data[bookKey];
                return {
                    title: bookData.title || 'Unknown Title',
                    author: bookData.authors?.[0]?.name || 'Unknown Author',
                    isbn: isbn,
                    year: bookData.publish_date || new Date().getFullYear(),
                    coverUrl: bookData.cover?.medium || null,
                    pages: bookData.number_of_pages || 0,
                    description: bookData.notes || ''
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('ISBN Lookup Error:', error);
            return null;
        }
    }
}

// UI Helper Functions
function showLoading(message) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function showNotification(type, title, message) {
    // Implementation from notifications module
    console.log(`[${type}] ${title}: ${message}`);
}