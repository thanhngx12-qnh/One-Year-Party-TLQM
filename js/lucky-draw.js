/**
 * Digital Lucky Draw Manager for Gala Dinner
 * Supports animated 3-digit slot spinning, sound synchronization,
 * duplicate prevention, winning history, and dual-screen broadcast.
 */
class LuckyDrawManager {
  constructor() {
    this.isSpinning = false;
    this.history = JSON.parse(localStorage.getItem('tlqm_lucky_history') || '[]');
    this.minRange = 1;
    this.maxRange = 150;
    this.spinIntervals = [null, null, null];
    this.targetNumber = null;
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tlqm_stage_channel') : null;
  }

  init() {
    this.slotD1 = document.getElementById('slot-digit-1');
    this.slotD2 = document.getElementById('slot-digit-2');
    this.slotD3 = document.getElementById('slot-digit-3');
    this.winnerCard = document.getElementById('lucky-winner-announcement');
    this.winnerNumEl = document.getElementById('lucky-winner-number');
    this.spinBtn = document.getElementById('btn-lucky-spin');
    this.inputMin = document.getElementById('lucky-min');
    this.inputMax = document.getElementById('lucky-max');
    this.btnResetHistory = document.getElementById('btn-lucky-reset-history');
    this.historyContainer = document.getElementById('lucky-history-pills');

    if (this.inputMin) {
      this.inputMin.addEventListener('change', (e) => {
        this.minRange = Math.max(1, parseInt(e.target.value) || 1);
      });
    }
    if (this.inputMax) {
      this.inputMax.addEventListener('change', (e) => {
        this.maxRange = Math.max(this.minRange, parseInt(e.target.value) || 150);
      });
    }

    if (this.spinBtn) {
      this.spinBtn.addEventListener('click', () => this.toggleSpin());
    }

    if (this.btnResetHistory) {
      this.btnResetHistory.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử các số đã trúng giải?')) {
          this.history = [];
          localStorage.removeItem('tlqm_lucky_history');
          this.renderHistory();
          if (this.channel) this.channel.postMessage({ type: 'LUCKY_RESET_HISTORY' });
        }
      });
    }

    if (this.channel) {
      this.channel.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'LUCKY_SPIN_START') {
          this.startSpinAnimation(e.data.targetNumber, false);
        } else if (e.data && e.data.type === 'LUCKY_RESET_HISTORY') {
          this.history = [];
          this.renderHistory();
        }
      });
    }

    this.renderHistory();
  }

  toggleSpin() {
    if (this.isSpinning) {
      // Already spinning, manual stop if needed
      return;
    }

    // Pick a winning number not yet won
    const availableNumbers = [];
    for (let i = this.minRange; i <= this.maxRange; i++) {
      if (!this.history.includes(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) {
      alert(`Đã quay hết toàn bộ vé từ ${this.minRange} đến ${this.maxRange}! Vui lòng mở rộng dải số hoặc xóa lịch sử.`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const winNum = availableNumbers[randomIndex];
    this.startSpinAnimation(winNum, true);
  }

  startSpinAnimation(winNum, broadcast = true) {
    this.isSpinning = true;
    this.targetNumber = winNum;
    if (this.spinBtn) {
      this.spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG QUAY SỐ...';
      this.spinBtn.disabled = true;
    }
    if (this.winnerCard) {
      this.winnerCard.classList.add('hidden');
    }

    if (broadcast && this.channel) {
      this.channel.postMessage({ type: 'LUCKY_SPIN_START', targetNumber: winNum });
    }

    // Format target number as 3 digits
    const targetStr = String(winNum).padStart(3, '0');
    const targetD1 = parseInt(targetStr[0]);
    const targetD2 = parseInt(targetStr[1]);
    const targetD3 = parseInt(targetStr[2]);

    // Fast rolling intervals for all 3 digits
    const digits = [this.slotD1, this.slotD2, this.slotD3];
    digits.forEach((el, idx) => {
      if (el) {
        el.classList.add('rolling');
        this.spinIntervals[idx] = setInterval(() => {
          const valEl = el.querySelector('.slot-digit-val') || el;
          valEl.textContent = Math.floor(Math.random() * 10);
          if (idx === 0 && Math.random() > 0.6 && window.soundEngine) {
            window.soundEngine.playSlotSpinTick();
          }
        }, 50);
      }
    });

    // Staggered Stop Timings for maximum stage suspense
    // Digit 1: stop at 1.8s
    setTimeout(() => {
      this.stopDigit(0, targetD1);
      if (window.soundEngine) window.soundEngine.playSlotStop(0);
    }, 1800);

    // Digit 2: stop at 2.8s
    setTimeout(() => {
      this.stopDigit(1, targetD2);
      if (window.soundEngine) window.soundEngine.playSlotStop(1);
    }, 2800);

    // Digit 3: stop at 3.9s -> Jackpot!
    setTimeout(() => {
      this.stopDigit(2, targetD3);
      this.finishSpin(winNum);
    }, 3900);
  }

  stopDigit(index, finalValue) {
    if (this.spinIntervals[index]) {
      clearInterval(this.spinIntervals[index]);
      this.spinIntervals[index] = null;
    }
    const digits = [this.slotD1, this.slotD2, this.slotD3];
    const el = digits[index];
    if (el) {
      el.classList.remove('rolling');
      el.classList.add('locked');
      const valEl = el.querySelector('.slot-digit-val') || el;
      valEl.textContent = finalValue;
      setTimeout(() => el.classList.remove('locked'), 500);
    }
  }

  finishSpin(winNum) {
    this.isSpinning = false;
    if (this.spinBtn) {
      this.spinBtn.innerHTML = '<i class="fas fa-play"></i> QUAY SỐ TIẾP THEO <span class="kbd-hint">Space / L</span>';
      this.spinBtn.disabled = false;
    }

    // Add to history
    if (!this.history.includes(winNum)) {
      this.history.unshift(winNum);
      localStorage.setItem('tlqm_lucky_history', JSON.stringify(this.history));
      this.renderHistory();
    }

    // Announce Winner Card
    const targetStr = String(winNum).padStart(3, '0');
    if (this.winnerNumEl) this.winnerNumEl.textContent = `SỐ ${targetStr}`;
    if (this.winnerCard) this.winnerCard.classList.remove('hidden');

    // Grand Audio & Confetti
    if (window.soundEngine) {
      window.soundEngine.playJackpot();
    }
    if (window.confettiEngine) {
      window.confettiEngine.celebrate();
    }
  }

  renderHistory() {
    if (!this.historyContainer) return;
    if (this.history.length === 0) {
      this.historyContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">Chưa có</span>';
      return;
    }
    this.historyContainer.innerHTML = this.history
      .map(num => `<span class="history-pill-badge">#${String(num).padStart(3, '0')}</span>`)
      .join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.luckyDrawManager = new LuckyDrawManager();
  window.luckyDrawManager.init();
});
