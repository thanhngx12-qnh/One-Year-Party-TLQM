// Game 2: Tạo Dáng Thần Tốc (Speed Posing Challenge)
class PoseGame {
  constructor() {
    // Dữ liệu dáng chụp chính thức Gala Dinner (5 dáng bảo mật)
    this.officialPoses = [
      {
        id: 1,
        title: 'Thử Thách Dáng 1: Đỉnh Cao Đồng Đội',
        desc: 'Tập trung quan sát và sắp xếp 5 vị trí khớp chuẩn từng cử chỉ tay chân!',
        image: 'assets/poses/pose_1.webp'
      },
      {
        id: 2,
        title: 'Thử Thách Dáng 2: Ngôi Sao Tỏa Sáng',
        desc: 'Đòi hỏi sự dẻo dai và thần thái hài hước đỉnh cao của cả 5 thành viên!',
        image: 'assets/poses/pose_2.webp'
      },
      {
        id: 3,
        title: 'Thử Thách Dáng 3: Siêu Nhân Đại Chiến',
        desc: 'Tạo hình góc cạnh, đồng đều và ăn khớp trong từng giây đếm ngược!',
        image: 'assets/poses/pose_3.webp'
      },
      {
        id: 4,
        title: 'Thử Thách Dáng 4: Kết Nối Bất Bại',
        desc: 'Dáng chụp đòi hỏi tinh thần gắn kết và phối hợp nhịp nhàng tuyệt đối!',
        image: 'assets/poses/pose_4.webp'
      },
      {
        id: 5,
        title: 'Thử Thách Dáng 5: Chung Một Mái Nhà TLQM',
        desc: 'Vòng thi quyết định! Dáng chụp cực độc và hài hước nhất đêm Gala!',
        image: 'assets/poses/pose_5.webp'
      }
    ];

    // Dữ liệu tập dượt / Demo (3 dáng mẫu không lộ dáng thi thật)
    this.demoPoses = [
      {
        id: 1,
        title: 'Dáng Tập Dượt 1: Thả Tim Đồng Đội',
        desc: 'Cả đội cùng đưa tay tạo hình trái tim lớn và cười thật tươi!',
        image: 'assets/poses/demo_pose_1.svg'
      },
      {
        id: 2,
        title: 'Dáng Tập Dượt 2: Quyết Tâm Chiến Thắng',
        desc: 'Tất cả thành viên giơ tay số 2 (Peace ✌️) và tạo dáng dứt khoát!',
        image: 'assets/poses/demo_pose_2.svg'
      },
      {
        id: 3,
        title: 'Dáng Tập Dượt 3: Tinh Thần Đồng Đội',
        desc: 'Cả đội đứng sát nhau, khoác vai và hô to khẩu hiệu TLQM!',
        image: 'assets/poses/demo_pose_3.svg'
      }
    ];

    this.isOfficial = false;
    this.poses = this.demoPoses;

    this.currentPoseIndex = 0;
    this.totalSeconds = 15;
    this.remainingSeconds = 15;
    this.timerInterval = null;
    this.isRunning = false;
    this.isRevealed = false;

    // Team scores (supports 2 to 4 teams)
    this.teamCount = 2;
    this.scores = [0, 0, 0, 0];
    this.teamNames = ['ĐỘI 1 (ÁO ĐỎ)', 'ĐỘI 2 (ÁO XANH)', 'ĐỘI 3 (ÁO VÀNG)', 'ĐỘI 4 (ÁO TÍM)'];

    this.init();
  }

  setDataMode(isOfficial, loadFirst = true) {
    this.isOfficial = !!isOfficial;
    this.poses = this.isOfficial ? this.officialPoses : this.demoPoses;

    const badge = document.getElementById('pose-mode-badge');
    const desc = document.getElementById('pose-main-desc');

    if (badge) {
      badge.className = `game-data-badge ${this.isOfficial ? 'official' : 'demo'}`;
      badge.innerHTML = this.isOfficial
        ? `<i class="fas fa-camera"></i> DỮ LIỆU GALA THẬT (${this.poses.length} DÁNG)`
        : `<i class="fas fa-flask"></i> BẢN TẬP DƯỢT DEMO (${this.poses.length} DÁNG)`;
    }

    if (desc) {
      desc.textContent = this.isOfficial
        ? `${this.teamCount} Đội (mỗi đội 5 thành viên) có 15 giây quan sát & hoàn thành dáng chụp giống hình mẫu nhất`
        : `Bản tập dượt thử nghiệm với 3 dáng vui nhộn. Toàn bộ 5 dáng chụp bí mật của Gala đang được bảo mật bằng mật khẩu!`;
    }

    this.renderPoseSelector();
    if (loadFirst) {
      this.loadPose(0, false);
    }
  }

  init() {
    this.renderPoseSelector();
    this.loadPose(0, false);
    this.bindEvents();
    this.setTeamCount(this.teamCount, false);
  }

  bindEvents() {
    const btnStart = document.getElementById('pose-start-timer');
    const btnReset = document.getElementById('pose-reset-timer');
    const btnPrev = document.getElementById('pose-prev-btn');
    const btnNext = document.getElementById('pose-next-btn');

    // Reveal buttons
    const btnRevealCenter = document.getElementById('pose-reveal-btn');
    const btnRevealToggle = document.getElementById('pose-reveal-toggle-btn');
    const coverOverlay = document.getElementById('pose-cover-overlay');

    if (btnRevealCenter) {
      btnRevealCenter.addEventListener('click', (e) => {
        e.stopPropagation();
        this.revealPose(true);
      });
    }

    if (coverOverlay) {
      coverOverlay.addEventListener('click', () => {
        if (!this.isRevealed) {
          this.revealPose(true);
        }
      });
    }

    if (btnRevealToggle) {
      btnRevealToggle.addEventListener('click', () => {
        this.toggleReveal();
      });
    }

    // Score buttons for Teams 1, 2, 3, 4
    for (let t = 1; t <= 4; t++) {
      const btnPlus = document.getElementById(`team${t}-plus`);
      const btnMinus = document.getElementById(`team${t}-minus`);
      if (btnPlus) btnPlus.addEventListener('click', () => this.addScore(t, 1));
      if (btnMinus) btnMinus.addEventListener('click', () => this.addScore(t, -1));

      const nameDisplay = document.getElementById(`team${t}-name-display`);
      if (nameDisplay) {
        nameDisplay.addEventListener('blur', (e) => {
          this.teamNames[t - 1] = e.target.textContent.trim() || `ĐỘI ${t}`;
          this.broadcastState();
        });
      }
    }

    // Dynamic Team Management Buttons (+ / - and pills)
    const btnAddTeam = document.getElementById('btn-add-team');
    const btnRemoveTeam = document.getElementById('btn-remove-team');
    if (btnAddTeam) btnAddTeam.addEventListener('click', () => this.addTeam());
    if (btnRemoveTeam) btnRemoveTeam.addEventListener('click', () => this.removeTeam());

    const teamPills = document.querySelectorAll('.team-count-pill-btn');
    teamPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const targetTeams = parseInt(pill.getAttribute('data-teams'), 10);
        if (targetTeams && targetTeams >= 2 && targetTeams <= 4) {
          this.setTeamCount(targetTeams, true);
        }
      });
    });

    const btnWinner = document.getElementById('pose-celebrate-winner');
    if (btnWinner) btnWinner.addEventListener('click', () => this.celebrateWinner());

    // Reset scores button
    const btnResetScores = document.getElementById('btn-reset-scores');
    if (btnResetScores) {
      btnResetScores.addEventListener('click', () => this.resetScores());
    }

    // Modal close button
    const modalClose = document.getElementById('winner-modal-close');
    const modal = document.getElementById('winner-modal');
    if (modalClose && modal) {
      modalClose.addEventListener('click', () => {
        modal.classList.remove('show');
      });
    }
  }

  renderPoseSelector() {
    const selectorContainer = document.getElementById('pose-selector');
    if (!selectorContainer) return;
    selectorContainer.innerHTML = '';

    this.poses.forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.className = `pose-pill-btn ${idx === this.currentPoseIndex ? 'active' : ''}`;
      btn.innerHTML = `<i class="fas fa-camera"></i> Dáng ${idx + 1} <span class="kbd-hint">Alt+${idx + 1}</span>`;
      btn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        this.loadPose(idx);
      });
      selectorContainer.appendChild(btn);
    });
  }

  loadPose(index, broadcast = true) {
    this.stopTimer();
    this.currentPoseIndex = index;
    this.remainingSeconds = this.totalSeconds;
    this.hidePose(false);

    const p = this.poses[index];

    // Update title & description
    const titleElem = document.getElementById('pose-current-title');
    const descElem = document.getElementById('pose-current-desc');
    const imgElem = document.getElementById('pose-display-image');
    const badgeElem = document.getElementById('pose-round-badge');

    if (titleElem) titleElem.textContent = p.title;
    if (descElem) descElem.textContent = p.desc;
    if (badgeElem) badgeElem.textContent = `VÒNG THI ${index + 1} / ${this.poses.length}`;
    if (imgElem) {
      imgElem.src = p.image;
      imgElem.alt = p.title;
    }

    // Update active pill
    const pills = document.querySelectorAll('.pose-pill-btn');
    pills.forEach((btn, i) => btn.classList.toggle('active', i === index));

    // Hide snapshot banner
    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) snapshotBanner.classList.remove('show');

    // Reset Start button
    const btnStart = document.getElementById('pose-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-play"></i> Bắt Đầu 15 Giây <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }

    this.updateTimerDisplay();

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('POSE_SELECT', { poseIndex: index });
    }
  }

  revealPose(startCountdown = true, broadcast = true) {
    if (this.isRevealed) return;
    this.isRevealed = true;

    // Ensure timer reset if was 0
    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.totalSeconds;
    }

    const cover = document.getElementById('pose-cover-overlay');
    if (cover) cover.classList.add('hidden');

    const toggleBtn = document.getElementById('pose-reveal-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Che Dáng Chụp <span class="kbd-hint">O</span>';
      toggleBtn.classList.remove('btn-gala-amber');
      toggleBtn.classList.add('btn-gala-outline');
    }

    if (window.soundEngine) window.soundEngine.playHint();

    if (startCountdown) {
      this.startTimer(broadcast);
    }

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('POSE_REVEAL');
    }

    if (window.app && window.app.showToast) {
      window.app.showToast('📸 Đã mở dáng chụp & Bắt đầu 15 giây!', 'Space / Enter');
    }
  }

  hidePose(showToast = true) {
    this.isRevealed = false;
    this.stopTimer();

    const cover = document.getElementById('pose-cover-overlay');
    if (cover) cover.classList.remove('hidden');

    const toggleBtn = document.getElementById('pose-reveal-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Mở Dáng Chụp <span class="kbd-hint">O / Enter</span>';
      toggleBtn.classList.add('btn-gala-amber');
      toggleBtn.classList.remove('btn-gala-outline');
    }

    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) snapshotBanner.classList.remove('show');

    if (window.app && window.app.showToast) {
      window.app.showToast('🔒 Đã che lại ảnh dáng chụp bí mật', 'O');
    }
  }

  toggleReveal() {
    if (this.isRevealed) {
      this.hidePose();
    } else {
      this.revealPose(true);
    }
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(broadcast = true) {
    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.totalSeconds;
    }
    this.isRunning = true;
    const btnStart = document.getElementById('pose-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-pause"></i> Tạm Dừng <span class="kbd-hint">Space</span>';
      btnStart.classList.add('running');
    }

    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) snapshotBanner.classList.remove('show');

    if (window.soundEngine) window.soundEngine.playTick();

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('POSE_START_TIMER');
    }

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerDisplay();

      if (this.remainingSeconds <= 3 && this.remainingSeconds > 0) {
        if (window.soundEngine) window.soundEngine.playWarningTick();
        const vignette = document.getElementById('stage-urgent-vignette');
        if (vignette) vignette.classList.add('active');
      } else if (this.remainingSeconds > 3) {
        if (window.soundEngine) window.soundEngine.playTick();
      }

      if (this.remainingSeconds <= 0) {
        this.triggerSnapshot();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    const vignette = document.getElementById('stage-urgent-vignette');
    if (vignette) vignette.classList.remove('active');
    const btnStart = document.getElementById('pose-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-play"></i> Tiếp Tục <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }
  }

  stopTimer() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    const vignette = document.getElementById('stage-urgent-vignette');
    if (vignette) vignette.classList.remove('active');
    const btnStart = document.getElementById('pose-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-redo"></i> Đếm Lại <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }
  }

  resetTimer(broadcast = true) {
    this.stopTimer();
    this.remainingSeconds = this.totalSeconds;
    this.updateTimerDisplay();
    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) snapshotBanner.classList.remove('show');

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('POSE_RESET');
    }
  }

  triggerSnapshot() {
    this.stopTimer();

    // 1. Play Camera Shutter
    if (window.soundEngine) {
      window.soundEngine.playShutter();
      setTimeout(() => window.soundEngine.playCheer(), 500);
    }

    // 2. Camera Flash animation
    const flashElem = document.getElementById('camera-flash-overlay');
    if (flashElem) {
      flashElem.classList.add('flash');
      setTimeout(() => flashElem.classList.remove('flash'), 600);
    }

    // 3. Show "GIỮ NGUYÊN DÁNG! TÁCH TÁCH!" banner
    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) {
      snapshotBanner.classList.add('show');
    }

    // 4. Confetti burst
    if (window.confettiEngine) {
      window.confettiEngine.burst(80);
    }
  }

  updateTimerDisplay() {
    const timerText = document.getElementById('pose-timer-text');
    const timerBar = document.getElementById('pose-timer-bar');

    if (timerText) {
      timerText.textContent = `${this.remainingSeconds}s`;
      timerText.classList.toggle('urgent', this.remainingSeconds <= 3);
    }

    if (timerBar) {
      const percentage = (this.remainingSeconds / this.totalSeconds) * 100;
      timerBar.style.width = `${percentage}%`;
      timerBar.classList.toggle('urgent', this.remainingSeconds <= 3);
    }
  }

  setTeamCount(count, broadcast = true) {
    this.teamCount = Math.min(4, Math.max(2, count));

    // Update section class for dynamic sizing (.teams-2, .teams-3, .teams-4)
    const poseSection = document.getElementById('section-pose');
    if (poseSection) {
      poseSection.classList.remove('teams-2', 'teams-3', 'teams-4');
      poseSection.classList.add(`teams-${this.teamCount}`);
    }

    // Update main titles & labels
    const mainTitle = document.getElementById('pose-main-title');
    const mainDesc = document.getElementById('pose-main-desc');
    const lockSub = document.getElementById('pose-lock-subtitle');
    const countDisplay = document.getElementById('pose-team-count-display');

    if (countDisplay) {
      countDisplay.textContent = this.teamCount;
    } else if (mainTitle) {
      mainTitle.innerHTML = `📸 TẠO DÁNG THẦN TỐC • ĐỐI ĐẦU ${this.teamCount} ĐỘI`;
    }
    if (mainDesc) {
      mainDesc.textContent = `${this.teamCount} Đội (mỗi đội 5 thành viên) có 15 giây quan sát & hoàn thành dáng chụp giống hình mẫu nhất`;
    }
    if (lockSub) {
      lockSub.textContent = `${this.teamCount} Đội hãy chuẩn bị sẵn sàng vị trí trên sân khấu!`;
    }

    // Update pill buttons active state
    const teamPills = document.querySelectorAll('.team-count-pill-btn');
    teamPills.forEach(pill => {
      const cnt = parseInt(pill.getAttribute('data-teams'), 10);
      pill.classList.toggle('active', cnt === this.teamCount);
    });

    // Update step buttons enabled/disabled states
    const btnAdd = document.getElementById('btn-add-team');
    const btnRemove = document.getElementById('btn-remove-team');
    if (btnAdd) btnAdd.disabled = (this.teamCount >= 4);
    if (btnRemove) btnRemove.disabled = (this.teamCount <= 2);

    // Update scores display & visibility
    this.updateScores();

    if (broadcast) {
      this.broadcastState();
      if (window.soundEngine) window.soundEngine.playClick();
      if (window.app && window.app.showToast) {
        window.app.showToast(`👥 Sàn đấu: ${this.teamCount} Đội đối đầu!`, '+ / -');
      }
    }
  }

  addTeam() {
    if (this.teamCount < 4) {
      this.setTeamCount(this.teamCount + 1, true);
    } else {
      if (window.app && window.app.showToast) {
        window.app.showToast('⚠️ Đã đạt tối đa 4 đội thi đấu!');
      }
    }
  }

  removeTeam() {
    if (this.teamCount > 2) {
      this.setTeamCount(this.teamCount - 1, true);
    } else {
      if (window.app && window.app.showToast) {
        window.app.showToast('⚠️ Tối thiểu 2 đội đối đầu!');
      }
    }
  }

  addScore(team, amount) {
    const idx = team - 1;
    if (idx < 0 || idx >= this.scores.length) return;
    this.scores[idx] = Math.max(0, this.scores[idx] + amount);
    if (amount > 0 && window.soundEngine) window.soundEngine.playCorrect();
    const icons = ['🔴', '🔵', '🟡', '🟣'];
    const hotkeys = ['1', '2', '3', '4'];
    if (window.app && window.app.showToast) {
      const sign = amount > 0 ? '+1' : '-1';
      window.app.showToast(`${icons[idx] || '⭐'} ${this.teamNames[idx]}: ${sign} Điểm (Tổng: ${this.scores[idx]})`, amount > 0 ? hotkeys[idx] : '');
    }
    this.updateScores();
    this.broadcastState();
  }

  resetScores() {
    this.scores = [0, 0, 0, 0];
    this.updateScores();
    if (window.soundEngine) window.soundEngine.playClick();
    if (window.app && window.app.showToast) {
      window.app.showToast('🔄 Đã đặt lại điểm tất cả các đội về 0', '0');
    }
    this.broadcastState();
  }

  updateScores() {
    for (let t = 1; t <= 4; t++) {
      const s = document.getElementById(`team${t}-score-display`);
      if (s) s.textContent = this.scores[t - 1];
      const box = document.getElementById(`team${t}-box`);
      if (box) {
        if (t <= this.teamCount) {
          box.classList.remove('hidden');
          box.style.removeProperty('display');
        } else {
          box.classList.add('hidden');
          box.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }

  // Alias for stage sync compatibility
  updateScoreDisplays() {
    this.updateScores();
  }

  celebrateWinner() {
    let maxScore = -1;
    let winners = [];

    for (let i = 0; i < this.teamCount; i++) {
      if (this.scores[i] > maxScore) {
        maxScore = this.scores[i];
        winners = [i];
      } else if (this.scores[i] === maxScore && maxScore > 0) {
        winners.push(i);
      }
    }

    let winnerText = '';
    let winnerSubtitle = '';

    if (maxScore <= 0) {
      winnerText = '🤝 CÁC ĐỘI ĐỒNG HẠNG!';
      winnerSubtitle = 'Chưa đội nào ghi điểm, cùng bứt phá ở các vòng thi tiếp theo!';
    } else if (winners.length === 1) {
      const wIdx = winners[0];
      winnerText = `🏆 ${this.teamNames[wIdx]} XUẤT SẮC CHIẾN THẮNG!`;
      winnerSubtitle = `Dẫn đầu với số điểm ấn tượng: ${this.scores[wIdx]} điểm! Nhận ngay phần quà vô địch từ Gala TLQM! 🎁`;
    } else {
      const winNames = winners.map(w => this.teamNames[w]).join(' & ');
      winnerText = `🤝 ĐỒNG QUÁN QUÂN: ${winNames}!`;
      winnerSubtitle = `Các đội xuất sắc bằng điểm nhau (${maxScore} điểm)! Chia đều phần thưởng danh giá! 🎉`;
    }

    const modalTitle = document.getElementById('winner-modal-title');
    const modalSub = document.getElementById('winner-modal-sub');
    const modal = document.getElementById('winner-modal');

    if (modalTitle) modalTitle.textContent = winnerText;
    if (modalSub) modalSub.textContent = winnerSubtitle;
    if (modal) modal.classList.add('show');

    if (window.soundEngine) {
      window.soundEngine.playCheer();
    }
    if (window.confettiEngine) {
      window.confettiEngine.celebrate();
      setTimeout(() => window.confettiEngine.celebrate(), 700);
    }

    if (window.stageSync) {
      window.stageSync.broadcast('CONFETTI');
      window.stageSync.broadcast('SOUND_CHEER');
    }
  }

  broadcastState() {
    if (window.stageSync) {
      window.stageSync.broadcast('SCORE_UPDATE', {
        scores: this.scores,
        teamCount: this.teamCount,
        teamNames: this.teamNames
      });
      window.stageSync.broadcast('TEAM_COUNT_UPDATE', {
        teamCount: this.teamCount
      });
    }
  }

  selectPose(index, broadcast = true) {
    this.loadPose(index, broadcast);
  }

  nextPose() {
    if (this.currentPoseIndex < this.poses.length - 1) {
      this.loadPose(this.currentPoseIndex + 1);
    }
  }

  prevPose() {
    if (this.currentPoseIndex > 0) {
      this.loadPose(this.currentPoseIndex - 1);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.poseGame = new PoseGame();
  window.gamePose = window.poseGame;
});
