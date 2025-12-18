/**
 * main.js
 * Contains all the interactive logic for the portfolio website.
 */

/* =========================================
   Background Animation (Particle Network)
   ========================================= */
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let particlesArray;

// Resize canvas to fill screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Mouse position for interaction
const mouse = {
    x: null,
    y: null,
    radius: 150
};

window.addEventListener("mousemove", function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
        this.color = Math.random() > 0.5 ? "#06b6d4" : "#a855f7"; // Cyan or Purple
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        // Mouse interaction (move away from mouse)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            if (mouse.x < this.x && this.x < canvas.width - 10) this.x += 3;
            if (mouse.x > this.x && this.x > 10) this.x -= 3;
            if (mouse.y < this.y && this.y < canvas.height - 10) this.y += 3;
            if (mouse.y > this.y && this.y > 10) this.y -= 3;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Initialize particles
function initParticles() {
    particlesArray = [];
    // Number of particles based on screen area
    let numberOfParticles = (canvas.width * canvas.height) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

// Animation Loop
function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    connectParticles();
}

// Draw lines between close particles
function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance =
                (particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x) +
                (particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y);

            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - distance / 20000;
                if (opacityValue > 0) {
                    ctx.strokeStyle = "rgba(140, 85, 247," + opacityValue * 0.2 + ")";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }
}

// Start Animation
initParticles();
animateParticles();

// Re-init on resize
window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
});


/* =========================================
   UI Interactivity (Fade In, Audio, etc.)
   ========================================= */

// --- Fade In Animation using IntersectionObserver ---
const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
};

const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach(el => {
    fadeObserver.observe(el);
});

// --- Audio Effects ---
const hoverSound = new Audio("audio/hover.mp3");
hoverSound.volume = 0.25;

const clickSound = new Audio("audio/click.mp3");
clickSound.volume = 0.5;

const playSound = (audio) => {
    const soundClone = audio.cloneNode();
    soundClone.volume = audio.volume;
    soundClone.play().catch(() => { }); // Catch error if user hasn't interacted yet
};

// Add hover sounds to interactive elements
document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("a, button, .skill-icon, .social-icon, .glass-card, .btn, .blog-card, .project-card, input, textarea, .nav-links a, .img-wrapper, .img-wrapper img");
    if (target && !target.hasAttribute("data-hover-sound-played")) {
        playSound(hoverSound);
        target.setAttribute("data-hover-sound-played", "true");
        target.addEventListener("mouseleave", () => {
            target.removeAttribute("data-hover-sound-played");
        }, {
            once: true
        });
    }
});

// Add click sounds
document.addEventListener("click", (e) => {
    if (e.target.closest("a, button, .skill-icon, .social-icon, .glass-card, .btn, .blog-card, .project-card, input, textarea, .nav-links a, .img-wrapper, .img-wrapper img")) {
        playSound(clickSound);
    }
});


// --- Custom Cursor ---
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");

if (cursorDot && cursorOutline) {
    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;
    });
}


// --- Active Navigation Highlighting ---
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
    let currentSection = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Offset for header height (-150px)
        if (pageYOffset >= sectionTop - 150) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href").includes(currentSection)) {
            link.classList.add("active");
        }
    });
});


// --- Typewriter Effect ---
const typewriterElement = document.getElementById("typewriter");
const textToType = "Software Engineer🧑‍💻";
let typeIndex = 0;

function typeWriter() {
    if (typeIndex < textToType.length) {
        // Use HTML entity for emoji compatibility if needed, but standard works here
        typewriterElement.innerHTML += textToType.charAt(typeIndex);
        typeIndex++;
        // Random typing speed for realism
        setTimeout(typeWriter, Math.random() * 100 + 50);
    }
}

if (typewriterElement) {
    const typeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                typeWriter();
                typeObserver.unobserve(entry.target);
            }
        });
    });
    typeObserver.observe(typewriterElement);
}


// --- 3D Tilt Effect for Glass Cards ---
const glassCards = document.querySelectorAll(".glass-card");

glassCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
    });
});


// --- Reading Progress Bar ---
const progressBar = document.getElementById("progress-bar");

if (progressBar) {
    window.addEventListener("scroll", () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrolled + "%";
    });
}


// --- Back To Top Button ---
const backToTopBtn = document.getElementById("back-to-top");

if (backToTopBtn) {
    window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add("visible");
        } else {
            backToTopBtn.classList.remove("visible");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


// --- Staggered Grid Animations ---
const staggerGrids = document.querySelectorAll(".grid-skills, .grid-blogs, .grid-services, .edu-grid, .job-container, .cert-grid");

const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const children = Array.from(entry.target.children);
            children.forEach((child, index) => {
                // Ensure initial state
                child.style.opacity = "0";
                child.style.transform = "translateY(50px)";
                child.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";

                // Stagger delay
                setTimeout(() => {
                    child.style.opacity = "1";
                    child.style.transform = "translateY(0)";
                }, index * 100); // 100ms delay between items
            });
            staggerObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

staggerGrids.forEach(grid => staggerObserver.observe(grid));