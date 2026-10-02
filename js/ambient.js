/**
 * Stage Ambient Particle & Golden Bokeh System
 * Transforms LED stage screen into an elegant, living awards gala environment.
 * Ultra-lightweight HTML5 Canvas engine (< 1% CPU).
 */
class StageAmbient {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.bokeh = [];
    this.animId = null;
    this.isRunning = true;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  init() {
    this.canvas = document.getElementById('stage-ambient-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'stage-ambient-canvas';
      this.canvas.className = 'stage-ambient-canvas';
      document.body.prepend(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.createParticles();
    this.createBokeh();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.canvas) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(45, Math.floor(this.width / 32));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.4 + 0.15,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.3 ? '#fde047' : '#ffffff'
      });
    }
  }

  createBokeh() {
    this.bokeh = [];
    const colors = ['rgba(212, 160, 23, 0.06)', 'rgba(11, 148, 68, 0.04)', 'rgba(34, 56, 115, 0.05)'];
    for (let i = 0; i < 5; i++) {
      this.bokeh.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 140 + 100,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        color: colors[i % colors.length]
      });
    }
  }

  animate() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Render soft bokeh orbs
    this.bokeh.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.radius) b.x = this.width + b.radius;
      if (b.x > this.width + b.radius) b.x = -b.radius;
      if (b.y < -b.radius) b.y = this.height + b.radius;
      if (b.y > this.height + b.radius) b.y = -b.radius;

      const grad = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      grad.addColorStop(0, b.color);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 2. Render twinkling golden stars
    this.particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.twinklePhase += p.twinkleSpeed;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.twinklePhase));
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0.1, currentAlpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = '#fbbf24';

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    this.animId = requestAnimationFrame(() => this.animate());
  }

  toggle() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.canvas.style.display = 'block';
      this.animate();
    } else {
      if (this.animId) cancelAnimationFrame(this.animId);
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.canvas.style.display = 'none';
    }
    return this.isRunning;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.ambientStage = new StageAmbient();
  window.ambientStage.init();
});
