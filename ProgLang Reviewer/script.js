// script.js
// Simple interactivity: console reminder and optional interactive toggle for examples.
(function() {
    // Display a friendly reminder in the console (non‑intrusive)
    console.log("📚 CS 321 reviewer loaded — design criteria & history.");

    // Optional: add a small interaction to code blocks? just a playful extra.
    // We'll allow clicking on any <pre> to toggle a "highlight" class.
    const preBlocks = document.querySelectorAll('pre');
    preBlocks.forEach(block => {
        block.addEventListener('click', function(e) {
            // Only toggle if the target is the pre itself, not inner (to avoid accidental)
            if (e.target === block) {
                block.style.transition = 'background 0.2s';
                block.style.background = '#1f3a5f'; // slightly lighter
                setTimeout(() => {
                    block.style.background = ''; // revert after 200ms
                }, 200);
            }
        });
    });

    // simple year display in footer? optional: shows current year next to "compiled"
    const footer = document.querySelector('footer');
    if (footer) {
        const yearSpan = document.createElement('span');
        yearSpan.textContent = ` · ${new Date().getFullYear()}`;
        yearSpan.style.fontSize = '0.9rem';
        yearSpan.style.opacity = '0.7';
        footer.appendChild(yearSpan);
    }
})();