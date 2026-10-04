/**
 * Stage Dual-Screen Synchronization Engine
 * Connects the Laptop Operator Console with the Audience LED Stage Screen via BroadcastChannel.
 * Local cross-window synchronization on the same browser and origin.
 */
class StageSync {
  constructor() {
    this.isStageScreen = window.location.search.includes('screen=stage') || window.name === 'TLQM_Stage_LED';
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tlqm_stage_channel') : null;
  }

  init() {
    if (this.isStageScreen) {
      this.setupStageWindow();
    } else {
      this.setupOperatorWindow();
    }
  }

  setConnectionStatus(connected, sectionId = '') {
    const status = document.getElementById('stage-connection-status');
    if (!status) return;
    const labels = { home: 'Trang chủ', showcase: 'Quà tặng', king: 'Vua Tiếng Việt', pose: 'Tạo dáng', awards: 'Trao quà' };
    status.textContent = connected ? `LED đã kết nối · ${labels[sectionId] || 'Sẵn sàng'}` : 'LED chưa kết nối · F8';
    status.classList.toggle('connected', connected);
  }

  // Reuse the existing game controllers; a newly opened LED receives current state.
  sendSnapshot() {
    if (!window.app) return;
    const king = window.kingGame;
    const pose = window.poseGame;
    const lucky = window.luckyDrawManager;
    const presentations = ['pose-cover-overlay', 'pose-snapshot-banner', 'winner-modal', 'lucky-winner-announcement', 'lucky-batch-modal'].map(id => {
      const el = document.getElementById(id);
      return { id, html: el.innerHTML, className: el.className };
    });
    this.broadcast('STAGE_SNAPSHOT', {
      sectionId: window.app.currentSection,
      isOfficial: window.app.isOfficialData,
      slideIndex: window.showcaseManager.currentSlide,
      awardsTab: window.awardsManager.currentTab,
      king: { index: king.currentIndex, seconds: king.remainingSeconds, running: king.isRunning, hint: king.isHintShown, revealed: king.isRevealed },
      pose: { index: pose.currentPoseIndex, teamCount: pose.teamCount, scores: pose.scores, teamNames: pose.teamNames, customAwards: pose.customAwards, phase: pose.phase, totalSeconds: pose.totalSeconds, remainingSeconds: pose.remainingSeconds, isRevealed: pose.isRevealed, isRunning: pose.isRunning },
      tier: lucky.activeTier,
      winners: lucky.recordedWinners,
      batchWinners: lucky.batchWinners || [],
      batchPage: lucky.batchPage || 0,
      digits: [lucky.slotD1, lucky.slotD2, lucky.slotD3].map(el => el.querySelector('.slot-digit-val').textContent),
      presentations,
    });
  }

  applySnapshot(msg) {
    window.app.applyDataMode(msg.isOfficial, false);
    window.showcaseManager.goToSlide(msg.slideIndex, false);
    window.awardsManager.switchTab(msg.awardsTab, false);
    const king = window.kingGame;
    king.loadQuestion(msg.king.index, false);
    king.remainingSeconds = msg.king.seconds;
    if (msg.king.hint) king.showHint(false);
    if (msg.king.revealed) king.revealAnswer(false);
    if (msg.king.running) king.startTimer(false);
    king.updateTimerDisplay();
    const pose = window.poseGame;
    pose.setTeamCount(msg.pose.teamCount, false);
    pose.loadPose(msg.pose.index, false);
    Object.assign(pose, msg.pose);
    pose.updateScores();
    pose.updateTimerDisplay();
    if (msg.pose.isRunning) pose.startTimer(false);
    const lucky = window.luckyDrawManager;
    lucky.recordedWinners = msg.winners;
    lucky.batchWinners = msg.batchWinners;
    lucky.batchPage = msg.batchPage;
    lucky.selectTier(msg.tier, true, false);
    lucky.updateQuotaTrackers();
    [lucky.slotD1, lucky.slotD2, lucky.slotD3].forEach((el, i) => { el.querySelector('.slot-digit-val').textContent = msg.digits[i]; });
    msg.presentations.forEach(({ id, html, className }) => {
      const el = document.getElementById(id);
      el.innerHTML = html;
      el.className = className;
    });
    lucky.cacheWinnerElements();
    window.app.switchSection(msg.sectionId, false);
  }

  setupStageWindow() {
    document.body.classList.add('stage-pure-led');
    document.body.classList.add('stage-fullscreen');

    if (!this.channel) return;

    this.channel.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'STAGE_SNAPSHOT':
          this.applySnapshot(msg);
          break;
        case 'STAGE_PING':
          this.channel.postMessage({ type: 'STAGE_CONNECTED', sectionId: window.app.currentSection });
          break;
        case 'SWITCH_SECTION':
          if (window.app) window.app.switchSection(msg.sectionId, false);
          break;
        case 'SHOWCASE_SLIDE':
          if (window.showcaseManager) window.showcaseManager.goToSlide(msg.slideIndex, false);
          break;
        case 'KING_SELECT_QUESTION':
          if (window.gameKing) window.gameKing.selectQuestion(msg.questionIndex, false);
          break;
        case 'KING_START_TIMER':
          if (window.gameKing) window.gameKing.startTimer(false);
          break;
        case 'KING_PAUSE_TIMER':
          window.kingGame.pauseTimer(false);
          window.kingGame.remainingSeconds = msg.seconds;
          window.kingGame.updateTimerDisplay();
          break;
        case 'KING_SHOW_HINT':
          window.kingGame.showHint(false);
          break;
        case 'KING_REVEAL_ANSWER':
          if (window.gameKing) window.gameKing.revealAnswer(false);
          break;
        case 'KING_RESET':
          if (window.gameKing) window.gameKing.resetQuestion(false);
          break;
        case 'POSE_SELECT':
          {
            const p = window.gamePose || window.poseGame;
            if (p) p.selectPose(msg.poseIndex, false);
          }
          break;
        case 'POSE_REVEAL':
          {
            const p = window.gamePose || window.poseGame;
            if (p) p.revealPose(false, false);
          }
          break;
        case 'POSE_START_TIMER':
          {
            const p = window.gamePose || window.poseGame;
            if (p) {
              p.startTimer(false);
              p.phase = msg.phase;
              p.remainingSeconds = msg.seconds;
              p.updateTimerDisplay();
            }
          }
          break;
        case 'POSE_PAUSE_TIMER':
          window.poseGame.pauseTimer(false);
          window.poseGame.remainingSeconds = msg.seconds;
          window.poseGame.updateTimerDisplay();
          break;
        case 'POSE_HIDE':
          window.poseGame.hidePose(false, false);
          break;
        case 'POSE_RESET':
          {
            const p = window.gamePose || window.poseGame;
            if (p) p.resetTimer(false);
          }
          break;
        case 'TEAM_COUNT_UPDATE':
          {
            const p = window.gamePose || window.poseGame;
            if (p && typeof p.setTeamCount === 'function') {
              p.setTeamCount(msg.teamCount, false);
            }
          }
          break;
        case 'SCORE_UPDATE':
          {
            const p = window.gamePose || window.poseGame;
            if (p) {
              if (msg.teamCount && typeof p.setTeamCount === 'function') {
                p.setTeamCount(msg.teamCount, false);
              }
              if (msg.teamNames) p.teamNames = msg.teamNames;
              if (msg.scores) p.scores = msg.scores;
              p.updateScores();
            }
          }
          break;
        case 'CONFETTI':
          if (window.confettiEngine) window.confettiEngine.celebrate();
          break;
        case 'SOUND_CHEER':
          if (window.soundEngine) window.soundEngine.playCheer();
          break;
        case 'THEME_CHANGE':
          if (window.app && typeof window.app.applyTheme === 'function') {
            window.app.applyTheme(msg.theme, false);
          }
          break;
        case 'AWARD_CEREMONY':
          {
            const p = window.gamePose || window.poseGame;
            if (p) {
              if (msg.customAwards) p.customAwards = msg.customAwards;
              p.celebrateWinner(false);
            }
          }
          break;
        case 'CUSTOM_AWARDS_UPDATE':
          {
            const p = window.gamePose || window.poseGame;
            if (p) {
              p.customAwards = msg.customAwards || [];
              p.renderCustomAwards();
            }
          }
          break;
        case 'AWARD_MODAL_CLOSE':
          {
            const p = window.gamePose || window.poseGame;
            if (p) p.closeAwardModal(false);
          }
          break;
        case 'DATA_MODE_CHANGE':
          if (window.app && typeof window.app.applyDataMode === 'function') {
            window.app.applyDataMode(msg.isOfficial, false);
          }
          break;
        case 'AWARDS_SUBTAB_CHANGE':
          if (window.awardsManager) {
            window.awardsManager.switchTab(msg.tab, false);
          }
          break;
      }
    });
    // Wait until all controllers have initialized before requesting current state.
    window.addEventListener('load', () => {
      this.channel.postMessage({ type: 'STAGE_READY' });
    }, { once: true });
  }

  setupOperatorWindow() {
    this.setConnectionStatus(false);
    if (this.channel) {
      let lastSeen = 0;
      this.channel.addEventListener('message', ({ data }) => {
        if (data?.type === 'STAGE_READY') this.sendSnapshot();
        if (data?.type === 'STAGE_CONNECTED') {
          lastSeen = Date.now();
          this.setConnectionStatus(true, data.sectionId);
        }
      });
      setInterval(() => {
        if (Date.now() - lastSeen > 5000) this.setConnectionStatus(false);
        this.broadcast('STAGE_PING');
      }, 2000);
    }
    // Add "Mở Màn LED" button handler
    const btnOpenStage = document.getElementById('btn-stage-window');
    if (btnOpenStage) {
      btnOpenStage.addEventListener('click', () => this.openStageWindow());
    }

    // Shortcut F8 to open stage window
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F8') {
        e.preventDefault();
        this.openStageWindow();
      }
    });
  }

  openStageWindow() {
    const url = window.location.origin + window.location.pathname + '?screen=stage';
    const stageWin = window.open(url, 'TLQM_Stage_LED', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
    if (stageWin) {
      stageWin.focus();
      if (window.app) {
        window.app.showToast('Kéo cửa sổ LED sang màn hình mở rộng rồi bấm F để toàn màn hình.', 'F8');
      }
    } else if (window.app) {
      window.app.showToast('Trình duyệt đang chặn cửa sổ LED. Cho phép cửa sổ bật lên rồi bấm F8 lại.');
    }
  }

  // Broadcast helper called by operator actions
  broadcast(type, data = {}) {
    if (this.isStageScreen || !this.channel) return;
    this.channel.postMessage({ type, ...data });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.stageSync = new StageSync();
  window.stageSync.init();
});
