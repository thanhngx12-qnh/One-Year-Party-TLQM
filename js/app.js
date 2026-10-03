// Bulletproof Fullscreen & Stage Theater Presentation Manager
class FullscreenManager {
  constructor() {
    this.btn = document.getElementById('btn-fullscreen');
    this.isStageMode = false;
    this.wasNativeFullscreen = false;
    this.init();
  }

  init() {
    // Listen for all browser native fullscreen events
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];

    fullscreenEvents.forEach(evt => {
      document.addEventListener(evt, () => {
        const isNative = this.isNativeFullscreen();
        if (isNative) {
          this.wasNativeFullscreen = true;
          this.setStageMode(true, false);
        } else if (this.wasNativeFullscreen) {
          // Native fullscreen was exited by the browser / user pressing ESC / Mac green button
          this.wasNativeFullscreen = false;
          this.setStageMode(false, false);
        }
      });
    });

    if (this.btn) {
      this.btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // ESC key exits stage mode if shortcuts modal is not open
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const helpModal = document.getElementById('shortcuts-modal');
        if (helpModal && helpModal.classList.contains('show')) {
          // Modal will handle its own close
          return;
        }
        if (this.isActive()) {
          this.exit();
        }
      }
    });
  }

  isNativeFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.webkitCurrentFullScreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  isActive() {
    return this.isStageMode || this.isNativeFullscreen();
  }

  toggle() {
    if (this.isActive()) {
      this.exit();
    } else {
      this.enter();
    }
  }

  enter() {
    // 1. Immediately request native browser fullscreen to preserve transient user activation token
    this.requestNative();

    // 2. Activate CSS Stage Theater presentation mode instantly
    this.setStageMode(true, true);
  }

  exit() {
    // 1. Exit native browser fullscreen if active
    this.exitNative();

    // 2. Disable CSS Stage Theater mode
    this.setStageMode(false, true);
  }

  requestNative() {
    const el = document.documentElement;
    try {
      let promise = null;
      if (el.requestFullscreen) {
        promise = el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        promise = el.webkitRequestFullscreen();
      } else if (el.webkitRequestFullScreen) {
        promise = el.webkitRequestFullScreen();
      } else if (el.mozRequestFullScreen) {
        promise = el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        promise = el.msRequestFullscreen();
      }

      if (promise && typeof promise.then === 'function') {
        promise.then(() => {
          this.wasNativeFullscreen = true;
        }).catch(err => {
          console.warn('Native fullscreen blocked, running in CSS Stage Theater Mode:', err);
        });
      }
    } catch (err) {
      console.warn('Native fullscreen call exception:', err);
    }
  }

  exitNative() {
    if (!this.isNativeFullscreen()) return;
    try {
      let promise = null;
      if (document.exitFullscreen) {
        promise = document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        promise = document.webkitExitFullscreen();
      } else if (document.webkitCancelFullScreen) {
        promise = document.webkitCancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        promise = document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        promise = document.msExitFullscreen();
      }

      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    } catch (e) {}
  }

  setStageMode(enable, showToast = true) {
    this.isStageMode = enable;
    document.body.classList.toggle('stage-fullscreen', enable);

    // Update main header button
    if (this.btn) {
      this.btn.innerHTML = enable
        ? '<i class="fas fa-compress"></i> <span class="btn-label">Thu Nhỏ</span> <span class="kbd-hint">ESC / F</span>'
        : '<i class="fas fa-expand"></i> <span class="btn-label">Toàn Màn</span> <span class="kbd-hint">F</span>';
      this.btn.classList.toggle('active-fullscreen', enable);
    }

    if (showToast && window.app && window.app.showToast) {
      window.app.showToast(
        enable ? '🖥️ Chế Độ Sân Khấu Toàn Màn Hình' : '📐 Thu Nhỏ Màn Hình',
        enable ? 'ESC / F' : 'F'
      );
    }
  }
}

// Main App Controller
class App {
  constructor() {
    this.currentSection = 'home';
    this.fullscreenManager = null;
    this.toastTimeout = null;
    this.init();
  }

  init() {
    this.setupNavigation();
    this.fullscreenManager = new FullscreenManager();
    window.fullscreenManager = this.fullscreenManager;
    this.setupControls();
    this.setupKeyboardShortcuts();
    this.setupHelpModal();
    this.setupSecurityMode();
  }

  showToast(text, keyHint = null) {
    let toast = document.getElementById('gala-hud-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'gala-hud-toast';
      toast.className = 'gala-hud-toast';
      document.body.appendChild(toast);
    }
    let html = `<span>${text}</span>`;
    if (keyHint) {
      html = `<span class="toast-key">${keyHint}</span> ` + html;
    }
    toast.innerHTML = html;
    toast.classList.add('show');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 1800);
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('[data-target-section]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target-section');
        this.switchSection(target);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }

  switchSection(sectionId) {
    this.currentSection = sectionId;

    // Update nav buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-target-section') === sectionId);
    });

    // Update section visibility
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === `section-${sectionId}`);
    });

    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-pause running timers and audio when leaving sections
    if (sectionId !== 'showcase' && window.showcaseManager) {
      window.showcaseManager.stopAllAudio();
    }
    if (sectionId !== 'king' && window.kingGame && window.kingGame.isRunning) {
      window.kingGame.pauseTimer();
    }
    if (sectionId !== 'pose' && window.poseGame && window.poseGame.isRunning) {
      window.poseGame.pauseTimer();
    }

    const sectionNames = {
      'home': 'Trang Chủ Gala TLQM',
      'showcase': 'Cơ Cấu Quà Tặng & Bốc Thăm',
      'king': 'Game 1: Vua Tiếng Việt',
      'pose': 'Game 2: Tạo Dáng Thần Tốc'
    };
    const keyMap = {
      'home': 'F1',
      'showcase': 'F2',
      'king': 'F3',
      'pose': 'F4'
    };
    this.showToast(sectionNames[sectionId] || sectionId, keyMap[sectionId] || null);
  }

  setupControls() {
    // Audio Mute Toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.soundEngine) {
          const isMuted = window.soundEngine.toggleMute();
          soundBtn.innerHTML = isMuted 
            ? '<i class="fas fa-volume-mute"></i> <span class="btn-label">Âm: Tắt</span> <span class="kbd-hint">M</span>' 
            : '<i class="fas fa-volume-up"></i> <span class="btn-label">Âm Thanh</span> <span class="kbd-hint">M</span>';
          soundBtn.classList.toggle('muted', isMuted);
          if (!isMuted) window.soundEngine.playClick();
          this.showToast(isMuted ? '🔇 Âm thanh: Tắt' : '🔊 Âm thanh: Bật', 'M');
        }
      });
    }

    // Quick Celebrate Button
    const celebrateBtn = document.getElementById('btn-celebrate-gala');
    if (celebrateBtn) {
      celebrateBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playCheer();
        if (window.confettiEngine) window.confettiEngine.celebrate();
        this.showToast('🎆 Pháo Hoa Ăn Mừng Gala TLQM!', 'C');
      });
    }

    // BGM Festive Music Toggle
    const bgmBtn = document.getElementById('btn-bgm-toggle');
    if (bgmBtn) {
      bgmBtn.addEventListener('click', () => {
        if (window.soundEngine) {
          const isPlaying = window.soundEngine.toggleBgm();
          bgmBtn.innerHTML = isPlaying 
            ? '<i class="fas fa-compact-disc fa-spin"></i> <span class="btn-label">Nhạc Nền: Bật</span> <span class="kbd-hint">B</span>' 
            : '<i class="fas fa-music"></i> <span class="btn-label">Nhạc Nền</span> <span class="kbd-hint">B</span>';
          bgmBtn.classList.toggle('active', isPlaying);
          this.showToast(isPlaying ? '🎶 Đã bật Nhạc Nền Hội Nghị Gala' : '🔇 Đã tắt Nhạc Nền Hội Nghị', 'B');
        }
      });
    }
  }

  toggleFullscreen() {
    if (this.fullscreenManager) {
      this.fullscreenManager.toggle();
    }
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if typing inside an editable field or input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      // ==========================================
      // 1. GLOBAL NAVIGATION & SYSTEM SHORTCUTS
      // ==========================================
      if (e.key === 'F1' || (e.altKey && e.key === '1' && this.currentSection !== 'pose')) {
        e.preventDefault();
        this.switchSection('home');
        return;
      }
      if (e.key === 'F2' || (e.altKey && e.key === '2' && this.currentSection !== 'pose')) {
        e.preventDefault();
        this.switchSection('showcase');
        return;
      }
      if (e.key === 'F3' || (e.altKey && e.key === '3' && this.currentSection !== 'pose')) {
        e.preventDefault();
        this.switchSection('king');
        return;
      }
      if (e.key === 'F4' || (e.altKey && e.key === '4' && this.currentSection !== 'pose')) {
        e.preventDefault();
        this.switchSection('pose');
        return;
      }

      // Global F9 to open Security Mode / Unlock Modal
      if (e.key === 'F9') {
        e.preventDefault();
        this.toggleUnlockModal();
        return;
      }

      // Global F or F11 for Fullscreen
      if (e.key.toLowerCase() === 'f' || e.key === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
        return;
      }

      // Global M for Sound Mute / Unmute
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) soundBtn.click();
        return;
      }

      // Global C for Confetti Fireworks Gala Celebration
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const celebrateBtn = document.getElementById('btn-celebrate-gala');
        if (celebrateBtn) celebrateBtn.click();
        return;
      }

      // Global B for Gala Festive BGM (when not in showcase)
      if (e.key.toLowerCase() === 'b' && this.currentSection !== 'showcase') {
        e.preventDefault();
        const bgmBtn = document.getElementById('btn-bgm-toggle');
        if (bgmBtn) bgmBtn.click();
        return;
      }

      // Global ? or / or K for Shortcuts Help modal
      if (e.key === '?' || e.key === '/' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const helpModal = document.getElementById('shortcuts-modal');
        if (helpModal) {
          const isOpening = !helpModal.classList.contains('show');
          helpModal.classList.toggle('show');
          if (isOpening) {
            this.showToast('⌨️ Mở Bảng Phím Tắt Điều Khiển', '?');
            if (window.soundEngine) window.soundEngine.playClick();
          }
        }
        return;
      }

      // Escape key to close modals or exit fullscreen
      if (e.key === 'Escape') {
        const winnerModal = document.getElementById('winner-modal');
        const shortcutsModal = document.getElementById('shortcuts-modal');
        if (winnerModal && winnerModal.classList.contains('show')) {
          const game = window.poseGame || window.gamePose;
          if (game && typeof game.closeAwardModal === 'function') {
            game.closeAwardModal(true);
          } else {
            winnerModal.classList.remove('show');
          }
          this.showToast('Đã đóng bảng trao giải', 'ESC');
          return;
        }
        if (shortcutsModal && shortcutsModal.classList.contains('show')) {
          shortcutsModal.classList.remove('show');
          this.showToast('Đã đóng bảng phím tắt', 'ESC');
          return;
        }
        const prizeConfigModal = document.getElementById('prize-config-modal');
        if (prizeConfigModal && prizeConfigModal.classList.contains('show')) {
          prizeConfigModal.classList.remove('show');
          if (window.showcaseManager) window.showcaseManager.stopAudition();
          this.showToast('Đã đóng bảng cấu hình quà tặng', 'ESC');
          return;
        }
        if (this.fullscreenManager && this.fullscreenManager.isActive()) {
          this.fullscreenManager.exit();
          return;
        }
      }

      // ==========================================
      // 2. AT HOME SECTION (GALA HUB) SHORTCUTS
      // ==========================================
      if (this.currentSection === 'home') {
        if (e.key === '1' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          this.switchSection('showcase');
          return;
        }
        if (e.key === '2' || e.key.toLowerCase() === 'v') {
          e.preventDefault();
          this.switchSection('king');
          return;
        }
        if (e.key === '3' || e.key.toLowerCase() === 't') {
          e.preventDefault();
          this.switchSection('pose');
          return;
        }
      }

      // ==========================================
      // 3. SHOWCASE (CƠ CẤU QUÀ TẶNG & BỐC THĂM) SHORTCUTS
      // ==========================================
      if (this.currentSection === 'showcase' && window.showcaseManager) {
        // Direct number keys 1 to 9 to jump to slide 1..9 (index 0..8)
        if (/^[1-9]$/.test(e.key)) {
          const sIdx = parseInt(e.key, 10) - 1;
          if (sIdx < window.showcaseManager.totalSlides) {
            e.preventDefault();
            window.showcaseManager.goToSlide(sIdx);
            return;
          }
        }
        // '0' jumps to slide 10 (index 9)
        if (e.key === '0' && window.showcaseManager.totalSlides >= 10) {
          e.preventDefault();
          window.showcaseManager.goToSlide(9);
          return;
        }
        // '-' or '\' jumps to last slide
        if ((e.key === '-' || e.key === '\\') && window.showcaseManager.totalSlides > 1) {
          e.preventDefault();
          window.showcaseManager.goToSlide(window.showcaseManager.totalSlides - 1);
          return;
        }

        // Space key: Toggle Play / Pause program, or Lucky Draw action on last slide
        if (e.code === 'Space') {
          // If typing in input, don't hijack Space
          if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
            return;
          }
          e.preventDefault();
          if (window.showcaseManager.currentSlide === window.showcaseManager.totalSlides - 1 && window.luckyDrawManager) {
            window.luckyDrawManager.handleSpaceKey();
            return;
          }
          window.showcaseManager.togglePlayPauseProgram();
          return;
        }

        // Enter: Next Slide (or trigger Lucky Draw record if on last slide and not in input)
        if (e.key === 'Enter') {
          if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            return; // Let native enter/form submit work
          }
          e.preventDefault();
          if (window.showcaseManager.currentSlide === window.showcaseManager.totalSlides - 1 && window.luckyDrawManager) {
            window.luckyDrawManager.handleSpaceKey();
            return;
          }
          window.showcaseManager.nextSlide();
          return;
        }

        // Next Slide (ArrowRight, PageDown, N)
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key.toLowerCase() === 'n') {
          e.preventDefault();
          window.showcaseManager.nextSlide();
          return;
        }

        // Prev Slide (ArrowLeft, PageUp, P, Backspace)
        if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key.toLowerCase() === 'p' || e.key === 'Backspace') {
          e.preventDefault();
          window.showcaseManager.prevSlide();
          return;
        }

        // V: Toggle MC voice narration
        if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          window.showcaseManager.toggleVoice();
          return;
        }

        // L: Spin Lucky Draw on Slide 11, or toggle drum SFX
        if (e.key.toLowerCase() === 'l') {
          e.preventDefault();
          if (window.showcaseManager.currentSlide === window.showcaseManager.totalSlides - 1 && window.luckyDrawManager) {
            window.luckyDrawManager.toggleSpin();
          } else {
            window.showcaseManager.toggleLuckySound();
          }
          return;
        }

        // B: Toggle background music
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          window.showcaseManager.toggleMusic();
          return;
        }

        // A: Toggle auto play
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          window.showcaseManager.toggleAutoPlay();
          return;
        }

        // R: Replay voice narration
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          window.showcaseManager.replayVoice();
          return;
        }

        // O: Open Prize Config & Voice Sync Modal
        if (e.key.toLowerCase() === 'o') {
          e.preventDefault();
          const configBtn = document.getElementById('btn-prize-config-modal');
          if (configBtn) configBtn.click();
          return;
        }

        // Home: first slide
        if (e.key === 'Home') {
          e.preventDefault();
          window.showcaseManager.goToSlide(0);
          return;
        }

        // End: last slide (backdrop VIP)
        if (e.key === 'End') {
          e.preventDefault();
          window.showcaseManager.goToSlide(window.showcaseManager.totalSlides - 1);
          return;
        }
      }

      // ==========================================
      // 4. GAME 1: VUA TIẾNG VIỆT SHORTCUTS
      // ==========================================
      if (this.currentSection === 'king' && window.kingGame) {
        // Direct number keys 1 to 9 to jump to questions
        if (/^[1-9]$/.test(e.key)) {
          const qIndex = parseInt(e.key, 10) - 1;
          if (qIndex < window.kingGame.questions.length) {
            e.preventDefault();
            window.kingGame.loadQuestion(qIndex);
            return;
          }
        }
        if (e.code === 'Space') {
          e.preventDefault();
          window.kingGame.toggleTimer();
          return;
        }
        if (e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'g') {
          e.preventDefault();
          window.kingGame.showHint();
          return;
        }
        if (e.key === 'Enter' || e.key.toLowerCase() === 'a') {
          e.preventDefault();
          window.kingGame.revealAnswer();
          return;
        }
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key.toLowerCase() === 'n') {
          e.preventDefault();
          window.kingGame.nextQuestion();
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          window.kingGame.prevQuestion();
          return;
        }
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          window.kingGame.resetQuestion();
          return;
        }
      }

      // ==========================================
      // 5. GAME 2: TẠO DÁNG THẦN TỐC SHORTCUTS
      // ==========================================
      if (this.currentSection === 'pose' && window.poseGame) {
        // If winner modal is active, Space or Enter closes it
        const winnerModal = document.getElementById('winner-modal');
        if (winnerModal && winnerModal.classList.contains('show')) {
          if (e.key === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            winnerModal.classList.remove('show');
            return;
          }
        }

        // Add Team: + or =
        if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
          e.preventDefault();
          const game = window.poseGame || window.gamePose;
          if (game) game.addTeam();
          return;
        }

        // Remove Team: - or _
        if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
          e.preventDefault();
          const game = window.poseGame || window.gamePose;
          if (game) game.removeTeam();
          return;
        }

        // Reset Scores: 0 or Shift + R
        if (e.key === '0' || (e.shiftKey && e.key.toLowerCase() === 'r')) {
          e.preventDefault();
          const game = window.poseGame || window.gamePose;
          if (game) game.resetScores();
          return;
        }

        // Team 1 (Áo Đỏ): 1 or A or Numpad1 to +1 point
        if (e.key === '1' || e.key.toLowerCase() === 'a' || e.code === 'Numpad1') {
          e.preventDefault();
          const game = window.poseGame || window.gamePose;
          if (game) game.addScore(1, 1);
          return;
        }
        // Team 1 (Áo Đỏ): Q or Z to -1 point
        if (e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'z') {
          e.preventDefault();
          const game = window.poseGame || window.gamePose;
          if (game) game.addScore(1, -1);
          return;
        }

        // Team 2 (Áo Xanh): 2 or B or Numpad2 to +1 point
        if (e.key === '2' || e.key.toLowerCase() === 'b' || e.code === 'Numpad2') {
          e.preventDefault();
          const game = window.poseGame || window.gamePose;
          if (game) game.addScore(2, 1);
          return;
        }
        // Team 2 (Áo Xanh): W or X to -1 point
        if (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 'x') {
          e.preventDefault();
          const game = window.poseGame || window.gamePose;
          if (game) game.addScore(2, -1);
          return;
        }

        // Team 3 (Áo Vàng): 3 to +1 point, E to -1 point
        if (e.key === '3') {
          const game = window.poseGame || window.gamePose;
          if (game && game.teamCount >= 3) {
            e.preventDefault();
            game.addScore(3, 1);
            return;
          }
        }
        if (e.key.toLowerCase() === 'e') {
          const game = window.poseGame || window.gamePose;
          if (game && game.teamCount >= 3) {
            e.preventDefault();
            game.addScore(3, -1);
            return;
          }
        }

        // Team 4 (Áo Tím): 4 to +1 point, U to -1 point
        if (e.key === '4') {
          const game = window.poseGame || window.gamePose;
          if (game && game.teamCount >= 4) {
            e.preventDefault();
            game.addScore(4, 1);
            return;
          }
        }
        if (e.key.toLowerCase() === 'u') {
          const game = window.poseGame || window.gamePose;
          if (game && game.teamCount >= 4) {
            e.preventDefault();
            game.addScore(4, -1);
            return;
          }
        }

        // Trao Giải Vô Địch: T
        if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          const game = window.poseGame || window.gamePose;
          if (game) game.celebrateWinner();
          return;
        }

        // Alt + 1..5 or Shift + 1..5: Jump to Pose 1..5
        if ((e.altKey || e.shiftKey) && ['1', '2', '3', '4', '5'].includes(e.key)) {
          e.preventDefault();
          window.poseGame.loadPose(parseInt(e.key, 10) - 1);
          return;
        }

        // Prev / Next Pose: [ and ] or ArrowLeft/ArrowRight or P/N
        if (e.key === '[' || e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          window.poseGame.prevPose();
          return;
        }
        if (e.key === ']' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key.toLowerCase() === 'n') {
          e.preventDefault();
          window.poseGame.nextPose();
          return;
        }

        // Reveal / Timer actions
        if (e.code === 'Space') {
          e.preventDefault();
          if (!window.poseGame.isRevealed) {
            window.poseGame.revealPose(true);
          } else {
            window.poseGame.toggleTimer();
          }
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!window.poseGame.isRevealed) {
            window.poseGame.revealPose(true);
          } else {
            window.poseGame.toggleTimer();
          }
          return;
        }
        if (e.key.toLowerCase() === 'o') {
          e.preventDefault();
          window.poseGame.toggleReveal();
          return;
        }
        if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          window.poseGame.resetTimer();
          return;
        }
        if (e.key.toLowerCase() === 't' || e.key.toLowerCase() === 'v') {
          e.preventDefault();
          window.poseGame.celebrateWinner();
          return;
        }
      }
    });
  }

  setupHelpModal() {
    const helpBtn = document.getElementById('btn-shortcuts-help');
    const helpModal = document.getElementById('shortcuts-modal');
    const closeBtn = document.getElementById('shortcuts-modal-close');

    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', () => {
        helpModal.classList.add('show');
        this.showToast('⌨️ Mở Bảng Phím Tắt Điều Khiển', '?');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    if (closeBtn && helpModal) {
      closeBtn.addEventListener('click', () => {
        helpModal.classList.remove('show');
      });
    }
  }

  // =========================================================================
  // DATA SECURITY & MODE MANAGEMENT (DEMO vs OFFICIAL TALUNG@2026)
  // =========================================================================
  setupSecurityMode() {
    this.isOfficialData = localStorage.getItem('tlqm_gala_unlocked') === 'true';

    // Hook up Header Mode Toggle Button
    const modeBtn = document.getElementById('btn-mode-toggle');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        this.openUnlockModal();
      });
    }

    // Hook up Unlock Modal
    this.setupUnlockModal();

    // Apply current state
    this.applyDataMode(this.isOfficialData, false);
  }

  setupUnlockModal() {
    const modal = document.getElementById('unlock-modal');
    const closeBtn = document.getElementById('unlock-modal-close');
    const cancelBtn = document.getElementById('unlock-cancel-btn');
    const form = document.getElementById('unlock-form');
    const passInput = document.getElementById('unlock-password-input');
    const eyeBtn = document.getElementById('unlock-toggle-eye');
    const eyeIcon = document.getElementById('unlock-eye-icon');
    const errorMsg = document.getElementById('unlock-error-msg');

    if (!modal) return;

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeUnlockModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeUnlockModal());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeUnlockModal();
    });

    if (eyeBtn && passInput && eyeIcon) {
      eyeBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        eyeIcon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
      });
    }

    const submitBtn = document.getElementById('unlock-submit-btn');

    const handleVerify = () => {
      const pwd = passInput ? passInput.value.trim() : '';
      if (pwd === 'Talung@2026') {
        // Success!
        localStorage.setItem('tlqm_gala_unlocked', 'true');
        this.applyDataMode(true, true);
        this.closeUnlockModal();
        if (window.confettiEngine) window.confettiEngine.celebrate();
        if (window.soundEngine) window.soundEngine.playCheer();
        this.showToast('🎉 ĐÃ MỞ KHÓA DỮ LIỆU THẬT GALA TLQM!', 'Talung@2026');
      } else {
        // Error shake
        if (errorMsg) errorMsg.classList.remove('hidden');
        if (passInput) {
          passInput.classList.add('error');
          passInput.focus();
          setTimeout(() => passInput.classList.remove('error'), 800);
        }
        if (window.soundEngine) window.soundEngine.playBuzz();
        this.showToast('❌ Mật khẩu không đúng! Vui lòng thử lại.');
      }
    };

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleVerify();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleVerify();
      });
    }

    if (passInput) {
      passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleVerify();
        }
      });
    }
  }

  openUnlockModal() {
    const modal = document.getElementById('unlock-modal');
    const passInput = document.getElementById('unlock-password-input');
    const errorMsg = document.getElementById('unlock-error-msg');
    const footer = document.getElementById('unlock-mode-footer');
    if (!modal) return;

    if (errorMsg) errorMsg.classList.add('hidden');
    if (passInput) {
      passInput.value = '';
      passInput.type = 'password';
    }

    // If currently unlocked, show "Khóa lại về Demo" action
    if (footer) {
      if (this.isOfficialData) {
        footer.innerHTML = `
          <div class="unlock-footer-box">
            <span class="unlock-footer-text"><i class="fas fa-circle-check" style="color: var(--tlqm-green);"></i> Hệ thống đang chạy <strong>Dữ liệu Gala thật</strong>.</span>
            <button type="button" id="btn-lock-to-demo" class="btn-lock-demo">
              <i class="fas fa-lock"></i> Khóa lại về Bản Demo
            </button>
          </div>
        `;
        const lockBtn = document.getElementById('btn-lock-to-demo');
        if (lockBtn) {
          lockBtn.addEventListener('click', () => {
            localStorage.removeItem('tlqm_gala_unlocked');
            this.applyDataMode(false, true);
            this.closeUnlockModal();
            this.showToast('🔒 Đã khóa lại về Bản Demo!', 'Demo');
          });
        }
      } else {
        footer.innerHTML = `
          <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; margin-top: 10px;">
            <i class="fas fa-shield-alt"></i> Bản quyền nội dung Gala Kỷ Niệm Ra Mắt Thương Hiệu - Công ty Cổ phần Tà Lùng Quang Minh.
          </div>
        `;
      }
    }

    modal.classList.add('show');
    if (passInput && !this.isOfficialData) {
      setTimeout(() => passInput.focus(), 150);
    }
    if (window.soundEngine) window.soundEngine.playClick();
  }

  closeUnlockModal() {
    const modal = document.getElementById('unlock-modal');
    if (modal) modal.classList.remove('show');
  }

  toggleUnlockModal() {
    const modal = document.getElementById('unlock-modal');
    if (modal && modal.classList.contains('show')) {
      this.closeUnlockModal();
    } else {
      this.openUnlockModal();
    }
  }

  applyDataMode(isOfficial, broadcast = true) {
    this.isOfficialData = !!isOfficial;

    // Update King Game
    if (window.kingGame && typeof window.kingGame.setDataMode === 'function') {
      window.kingGame.setDataMode(this.isOfficialData, true);
    }

    // Update Pose Game
    if (window.poseGame && typeof window.poseGame.setDataMode === 'function') {
      window.poseGame.setDataMode(this.isOfficialData, true);
    }

    // Update Header Mode Button
    const modeBtn = document.getElementById('btn-mode-toggle');
    const modeIcon = document.getElementById('mode-status-icon');
    const modeLabel = document.getElementById('mode-status-label');
    const modeHint = document.getElementById('mode-status-hint');

    if (modeBtn) {
      modeBtn.className = `action-btn mode-status-btn ${this.isOfficialData ? 'official' : 'demo'}`;
      modeBtn.title = this.isOfficialData
        ? 'Dữ liệu Gala thật đang kích hoạt (Bấm để xem / Khóa lại Demo)'
        : 'Đang chạy Bản Demo thử nghiệm (Bấm để Mở khóa F9)';
    }
    if (modeIcon) {
      modeIcon.className = this.isOfficialData ? 'fas fa-shield-halved' : 'fas fa-lock';
    }
    if (modeLabel) {
      modeLabel.textContent = this.isOfficialData ? 'Gala Thật' : 'Bản Demo';
    }
    if (modeHint) {
      modeHint.textContent = this.isOfficialData ? 'Khóa F9' : 'Mở F9';
    }

    // Broadcast to Stage Screen (?screen=stage)
    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('DATA_MODE_CHANGE', { isOfficial: this.isOfficialData });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
