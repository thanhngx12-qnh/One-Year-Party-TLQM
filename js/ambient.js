/**
 * Stage Ambient - Ultra-lightweight background system (0% CPU load)
 * Keeps presentation buttery smooth and prevents GPU/browser throttling.
 */
class StageAmbient {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
  }

  init() {
    this.canvas = document.getElementById('stage-ambient-canvas');
    if (this.canvas) {
      // Hide canvas to eliminate all GPU render passes and repaints
      this.canvas.style.display = 'none';
    }
  }

  toggle() {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.ambientStage = new StageAmbient();
  window.ambientStage.init();
});
