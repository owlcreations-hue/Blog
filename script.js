// Configuration
const postsUrl = 'posts/posts.json';

// DOM Elements
const screens = document.querySelectorAll('.screen');
const navLinks = document.querySelectorAll('.nav-btn');
const modal = document.getElementById('reader-modal');
const readerBody = document.getElementById('reader-body');
const closeModal = document.querySelector('.close-modal');

// --- 1. Navigation Logic ---
function switchScreen(screenName) {
    // Hide all
    screens.forEach(s => s.classList.remove('active'));
    navLinks.forEach(n => n.classList.remove('active'));
    
    // Show Target
    const target = document.getElementById(screenName) || document.getElementById('gateway');
    target.classList.add('active');
    
    // Highlight Nav
    const activeLink = document.querySelector(`.nav-btn[data-target="${screenName}"]`);
    if(activeLink) activeLink.classList.add('active');
}

// Router (Hash Handler)
function handleHash() {
    const hash = window.location.hash; // #screen=wall OR #post=wall-01
    
    if (hash.includes('#post=')) {
        const postId = hash.split('=')[1];
        openPost(postId);
    } else if (hash.includes('#screen=')) {
        const screenName = hash.split('=')[1];
        switchScreen(screenName);
        modal.style.display = 'none'; // Close modal if navigating screens
    } else {
        switchScreen('gateway');
    }
}

window.addEventListener('hashchange', handleHash);
window.addEventListener('DOMContentLoaded', () => {
    loadPosts(); // Load data
    handleHash(); // Check initial URL
});

// --- 2. Blog Logic (Fetch & Render) ---
let allPosts = [];

async function loadPosts() {
    try {
        const response = await fetch(postsUrl);
        allPosts = await response.json();
        
        const wallGrid = document.getElementById('wall-grid');
        const pawauraGrid = document.getElementById('pawaura-grid');
        
        // Render English
        allPosts.filter(p => p.lang === 'en').forEach(post => {
            wallGrid.innerHTML += createCard(post);
        });
        
        // Render Sinhala
        allPosts.filter(p => p.lang === 'si').forEach(post => {
            pawauraGrid.innerHTML += createCard(post);
        });
        
    } catch (error) {
        console.error("Error loading posts:", error);
    }
}

function createCard(post) {
    return `
    <div class="post-card" onclick="window.location.hash='#post=${post.id}'">
        <div class="post-meta">${post.date || ''}</div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
    </div>
    `;
}

// --- 3. Reader / Modal Logic ---
async function openPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    modal.style.display = 'block';
    readerBody.innerHTML = '<p>Loading signal...</p>';

    try {
        const res = await fetch(post.file);
        const text = await res.text();
        readerBody.innerHTML = text;
        
        // Prepare "Say It" Form Metadata
        document.getElementById('say-it-form').dataset.subject = `Comment: ${post.title}`;
    } catch (err) {
        readerBody.innerHTML = '<p>Error loading content.</p>';
    }
}

// Close Modal
closeModal.onclick = () => {
    modal.style.display = 'none';
    window.location.hash = '#screen=wall'; // default back to wall
};
// Escape key to close
document.addEventListener('keydown', (e) => { if(e.key === "Escape") closeModal.click(); });

// --- 4. "Say It" Mailto Logic ---
document.getElementById('say-it-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const subject = this.dataset.subject || 'Website Comment';
    const name = document.getElementById('comment-name').value;
    const country = document.getElementById('comment-country').value;
    const bodyText = document.getElementById('comment-text').value;
    
    const finalBody = `From: ${name} (${country})%0D%0A%0D%0A"${bodyText}"`;
    
    window.location.href = `mailto:your-email@gmail.com?subject=${encodeURIComponent(subject)}&body=${finalBody}`;
});

// --- 5. Contact Form Logic ---
window.handleContact = function(e) {
    e.preventDefault();
    const msg = document.getElementById('contact-msg').value;
    window.location.href = `mailto:your-email@gmail.com?subject=Wire Contact&body=${encodeURIComponent(msg)}`;
};

// --- 6. Sparkle Effect ---
const colors = ['#FF0000', '#FFA500', '#FFFF00', '#FFC0CB', '#FFFFFF'];

document.addEventListener('click', (e) => {
    createSparkles(e.clientX, e.clientY);
});

function createSparkles(x, y) {
    for(let i=0; i<8; i++) {
        const spark = document.createElement('div');
        spark.className = 'sparkle';
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random direction
        const tx = (Math.random() - 0.5) * 100; 
        const ty = (Math.random() - 0.5) * 100;
        spark.style.setProperty('--tx', `${tx}px`);
        spark.style.setProperty('--ty', `${ty}px`);
        
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 800);
    }
}

// --- 7. Toggle Read Mode ---
const toggleReadBtn = document.getElementById('toggle-read-mode');
toggleReadBtn.addEventListener('click', () => {
    document.body.classList.toggle('reading-mode');
});
