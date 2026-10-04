/**
 * Stage Dual-Screen Synchronization Engine
 * Connects the Laptop Operator Console with the Audience LED Stage Screen via BroadcastChannel.
 * Zero-latency local cross-window synchronization.
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

  setupStageWindow() {
    document.body.classList.add('stage-pure-led');
    document.body.classList.add('stage-fullscreen');

    if (!this.channel) return;

    this.channel.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || !msg.type) return;

      switch (msg.type) {
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
            if (p) p.startTimer(false);
          }
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
        case 'LUCKY_SHOW_WINNER':
          if (window.luckyDrawManager) {
            window.luckyDrawManager.celebrateAndRecordWinner(msg.emp, msg.prizeKey, msg.customInfo, false);
          }
          break;
        case 'LUCKY_SHOW_BATCH_MODAL':
          if (window.luckyDrawManager) {
            window.luckyDrawManager.displayBatchModal(msg.winners, msg.batchTitle, msg.batchBadge, false);
          }
          break;
        case 'LUCKY_HIDE_BATCH_MODAL':
          if (window.luckyDrawManager) {
            window.luckyDrawManager.closeBatchModal(false);
          }
          break;
        case 'LUCKY_DELETE_WINNER':
          if (window.luckyDrawManager) {
            window.luckyDrawManager.deleteWinner(msg.id, false);
          }
          break;
        case 'LUCKY_RESET_WINNERS':
          if (window.luckyDrawManager) {
            window.luckyDrawManager.recordedWinners = [];
            window.luckyDrawManager.saveRecordedWinners();
            window.luckyDrawManager.updateQuotaTrackers();
            window.luckyDrawManager.renderWinnersTable();
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
  }

  setupOperatorWindow() {
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
        window.app.showToast('📺 Đã mở Màn LED sân khấu riêng biệt! Kéo cửa sổ sang màn LED và nhấn F11.', 'F8');
      }
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
