// Configuration
const BUBBLE_SIZE = 50; // static size in px
const POP_SOUND_SRCS = [
    'pop-1.mp3',
    'pop-2.mp3',
    'pop-3.mp3'
];
let poppedCount = 0;
let totalRows = 0;

// Helper: create and play a random sound (clone to prevent overlap)
function playRandomPopSound() {
    const src = POP_SOUND_SRCS[Math.floor(Math.random() * POP_SOUND_SRCS.length)];
    const snd = new Audio(src);
    snd.play();
}

// Counter update in nav
function updatePoppedCounter() {
    const el = document.getElementById('popped-counter');
    if (el) el.textContent = poppedCount;
}

// Bubble creation
function createBubble(row, col) {
    const el = document.createElement('div');
    el.className = 'bubble';
    el.tabIndex = 0;
    el.setAttribute('aria-label', 'Bubble - unpopped');
    el.addEventListener('click', function(e) {
        // Only handle click events (not synthetic key-driven clicks)
        if (e.pointerType === "mouse" || e.pointerType === "pen" || e.pointerType === undefined) {
            onBubblePop.call(el, e);
        }
    });
    el.addEventListener('keydown', function(e){
        // Avoid double event if a click will follow; only handle "real" key events
        if ((e.key === ' ' || e.key === 'Enter') && e.detail === 0) {
            e.preventDefault();
            onBubblePop.call(el, e);
        }
    });
    return el;
}

// Update to popped visual
function popBubble(bubble) {
    if (bubble.classList.contains('popped')) return;
    bubble.classList.add('popped');
    poppedCount += 1;
    updatePoppedCounter();
}

// Pop event handler
function onBubblePop(e) {
    if (this.classList.contains('popped')) return;
    popBubble(this);
    // Play sound with no overlap
    playRandomPopSound();
}

// Appends a batch of rows for infinite scroll
function appendRows(numRows) {
    const grid = document.getElementById('bubble-grid');
    const vw = Math.max(window.innerWidth, 375);
    const cols = Math.floor(vw / BUBBLE_SIZE);
    grid.style.gridTemplateColumns = `repeat(${cols}, ${BUBBLE_SIZE}px)`;
    grid.style.gridAutoRows = `${BUBBLE_SIZE}px`;
    grid.style.width = (cols * BUBBLE_SIZE) + 'px';

    for (let row = totalRows; row < totalRows + numRows; row++) {
        for (let col = 0; col < cols; col++) {
            const bubble = createBubble(row, col);
            grid.appendChild(bubble);
        }
    }
    totalRows += numRows;
}

// Infinite scroll handler
function handleScrollInfinite() {
    // How far from the bottom before loading more?
    const buffer = 180;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - buffer) {
        appendRows(6); // Add 6 rows at a time
    }
}

window.addEventListener("DOMContentLoaded", () => {
    poppedCount = 0;
    updatePoppedCounter();
    totalRows = 0;
    document.getElementById('bubble-grid').innerHTML = "";
    // Initial fill for visible area plus some extra
    const initialRows = Math.ceil((window.innerHeight - 64) / BUBBLE_SIZE) + 8;
    appendRows(initialRows);

    window.addEventListener('resize', () => {
        // On resize, clear and refill
        const grid = document.getElementById('bubble-grid');
        grid.innerHTML = '';
        totalRows = 0;
        const initialRows = Math.ceil((window.innerHeight - 64) / BUBBLE_SIZE) + 8;
        appendRows(initialRows);
    });
    window.addEventListener('scroll', handleScrollInfinite);
});
