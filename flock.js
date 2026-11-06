const canvas = document.getElementById("flockCanvas");
const ctx = canvas.getContext("2d");

// Responsive Canvas Size
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Configuration - Perfected for a slow, premium data-network grid
const BOID_COUNT = 40;
const MAX_SPEED = 0.3; // slow it dooooowwwwwwnnnn
const MAX_FORCE = 0.02;
const PERCEPTION_RADIUS = 90;     // Up from 75
const CONNECTION_DISTANCE = 170;  // Up from 110 (creates longer data connections)


class Node {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * MAX_SPEED;
        this.vy = (Math.random() - 0.5) * MAX_SPEED;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Screen Wrap-around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    render() {
        // Draw a clean, technical circular data node
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); // Tiny, crisp 2px node dots
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)"; // Bright enough to anchor the network
        ctx.fill();
    }

    flock(boids) {
        let alignX = 0, alignY = 0;
        let cohesionX = 0, cohesionY = 0;
        let separationX = 0, separationY = 0;
        let total = 0;

        for (let other of boids) {
            let d = Math.hypot(this.x - other.x, this.y - other.y);
            if (other !== this && d < PERCEPTION_RADIUS) {
                alignX += other.vx;
                alignY += other.vy;
                cohesionX += other.x;
                cohesionY += other.y;
                separationX += (this.x - other.x) / d;
                separationY += (this.y - other.y) / d;
                total++;
            }
        }

        if (total > 0) {
            alignX /= total; alignY /= total;
            cohesionX /= total; cohesionY /= total;
            cohesionX -= this.x; cohesionY -= this.y;

            this.vx += (alignX * 0.05 + cohesionX * 0.01 + separationX * 0.25) * MAX_FORCE;
            this.vy += (alignY * 0.05 + cohesionY * 0.01 + separationY * 0.25) * MAX_FORCE;

            const speed = Math.hypot(this.vx, this.vy);
            if (speed > MAX_SPEED) {
                this.vx = (this.vx / speed) * MAX_SPEED;
                this.vy = (this.vy / speed) * MAX_SPEED;
            }
        }
    }
}

// Instantiate the network array
const boids = Array.from({ length: BOID_COUNT }, () => new Node());

// Draw the glowing network lines between adjacent nodes
function drawNetworkConnections() {
    for (let i = 0; i < boids.length; i++) {
        for (let j = i + 1; j < boids.length; j++) {
            const dist = Math.hypot(boids[i].x - boids[j].x, boids[i].y - boids[j].y);
            
            if (dist < CONNECTION_DISTANCE) {
                // CHANGED: Boosted baseline opacity multiplier from 0.15 to 0.45 
                const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.45;
                
                ctx.beginPath();
                ctx.moveTo(boids[i].x, boids[i].y);
                ctx.lineTo(boids[j].x, boids[j].y);
                
                // Pure white strokes with the enhanced visible opacity
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                
                // CHANGED: Increased stroke width slightly for clean legibility on black
                ctx.lineWidth = 1.25; 
                
                ctx.stroke();
            }
        }
    }
}


// Consolidated Animation Loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Calculate & Draw the network web first (sits behind the node points)
    drawNetworkConnections();
    
    // 2. Update and draw the actual nodes
    for (let boid of boids) {
        boid.flock(boids);
        boid.update();
        boid.render();
    }
    requestAnimationFrame(animate);
}
animate();
