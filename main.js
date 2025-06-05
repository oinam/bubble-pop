// Configuration
const BUBBLE_SIZE = 50; // static size in px
const POP_SOUND_SRCS = [
    'pop-1.mp3',
    'pop-2.mp3',
    'pop-3.mp3'
];
let poppedCount = 0;
let totalRows = 0;

// Track popped bubbles in RAM throughout the session (resets on refresh)
const poppedSet = new Set();

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
    // Restore popped state if present in poppedSet
    const key = `${row},${col}`;
    if (poppedSet.has(key)) {
        el.classList.add('popped');
        el.setAttribute('aria-label', 'Bubble - popped');
    } else {
        el.setAttribute('aria-label', 'Bubble - unpopped');
    }
    el.addEventListener('click', function(e) {
        // Only handle click events (not synthetic key-driven clicks)
        if (e.pointerType === "mouse" || e.pointerType === "pen" || e.pointerType === undefined) {
            onBubblePop.call(el, e, row, col);
        }
    });
    el.addEventListener('keydown', function(e){
        // Avoid double event if a click will follow; only handle "real" key events
        if ((e.key === ' ' || e.key === 'Enter') && e.detail === 0) {
            e.preventDefault();
            onBubblePop.call(el, e, row, col);
        }
    });
    return el;
}

// Update to popped visual
function popBubble(bubble, row, col) {
    if (bubble.classList.contains('popped')) return;
    bubble.classList.add('popped');
    bubble.setAttribute('aria-label', 'Bubble - popped');
    const key = `${row},${col}`;
    if (!poppedSet.has(key)) {
        poppedSet.add(key);
        poppedCount += 1;
        updatePoppedCounter();
    }
}

// Pop event handler
function onBubblePop(e, row, col) {
    if (this.classList.contains('popped')) return;
    popBubble(this, row, col);
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
    totalRows = 0;
    poppedSet.clear();
    updatePoppedCounter();
    document.getElementById('bubble-grid').innerHTML = "";
    // Initial fill for visible area plus some extra
    const initialRows = Math.ceil((window.innerHeight - 64) / BUBBLE_SIZE) + 8;
    appendRows(initialRows);

    window.addEventListener('resize', () => {
        // On resize, clear and refill the grid; preserve popped state in RAM
        const grid = document.getElementById('bubble-grid');
        grid.innerHTML = '';
        totalRows = 0;
        // Recompute cols; all remaining rows are restored, count is updated below
        const initialRows = Math.ceil((window.innerHeight - 64) / BUBBLE_SIZE) + 8;
        let restorePopped = 0;
        appendRows(initialRows);
        // Re-count popped bubbles for new display
        const vwNow = Math.max(window.innerWidth, 375);
        const colsNow = Math.floor(vwNow / BUBBLE_SIZE);
        for (let key of poppedSet) {
            const [row, col] = key.split(',').map(Number);
            // only count those currently in the DOM (visible)
            if (
                row < totalRows &&
                col < colsNow
            ) {
                restorePopped++;
            }
        }
        poppedCount = restorePopped;
        updatePoppedCounter();
    });
    window.addEventListener('scroll', handleScrollInfinite);
});
