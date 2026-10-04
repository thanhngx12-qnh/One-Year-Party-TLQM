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
        title: 'Thử Thách Dáng 5: Chung Một Mái Nhà Tà Lùng Quang Minh',
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
        desc: 'Cả đội đứng sát nhau, khoác vai và hô to khẩu hiệu Tà Lùng Quang Minh!',
        image: 'assets/poses/demo_pose_3.svg'
      }
    ];

    this.isOfficial = false;
    this.poses = this.demoPoses;

    this.currentPoseIndex = 0;
    this.observeSeconds = 5;
    this.poseSeconds = 10;
    this.totalSeconds = 5;
    this.remainingSeconds = 5;
    this.phase = 'ready'; // 'ready' | 'observe' | 'pose' | 'voted'
    this.timerInterval = null;
    this.isRunning = false;
    this.isRevealed = false;

    // Team scores (supports 2 to 4 teams)
    this.teamCount = 2;
    this.scores = [0, 0, 0, 0];
    this.teamNames = ['ĐỘI 1 (ÁO ĐỎ)', 'ĐỘI 2 (ÁO XANH)', 'ĐỘI 3 (ÁO VÀNG)', 'ĐỘI 4 (ÁO TÍM)'];
    this.customAwards = this.loadCustomAwards();

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
        ? `${this.teamCount} Đội có 5 giây nhìn LED, sau đó quay lưng 10 giây tạo dáng • Khán giả chấm điểm bằng tràng vỗ tay hoặc hô to (Vui là chính!)`
        : `Bản tập dượt thử nghiệm với 3 dáng vui nhộn (5s nhìn LED + 10s quay lưng tạo dáng, khán giả vỗ tay chấm điểm). Toàn bộ 5 dáng Gala đang được bảo mật!`;
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
    if (btnStart) btnStart.addEventListener('click', () => this.toggleTimer());
    if (btnReset) btnReset.addEventListener('click', () => this.resetTimer());
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevPose());
    if (btnNext) btnNext.addEventListener('click', () => this.nextPose());

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

    // Award ceremony & custom prizes setup
    this.setupAwardEvents();
  }

  setupAwardEvents() {
    // Modal close buttons (bottom button and top-right corner)
    const modalClose = document.getElementById('winner-modal-close');
    const cornerClose = document.getElementById('winner-modal-close-corner');
    const modal = document.getElementById('winner-modal');

    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeAwardModal(true));
    }
    if (cornerClose) {
      cornerClose.addEventListener('click', () => this.closeAwardModal(true));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAwardModal(true);
      });
    }

    // Toggle Add Award Form
    const btnToggleAdd = document.getElementById('btn-toggle-add-award');
    const formWrapper = document.getElementById('add-award-form-wrapper');
    const btnCancelAdd = document.getElementById('btn-cancel-add-award');

    if (btnToggleAdd && formWrapper) {
      btnToggleAdd.addEventListener('click', () => {
        const isHidden = formWrapper.style.display === 'none' || !formWrapper.style.display;
        formWrapper.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          this.populateRecipientOptions();
          const inputTitle = document.getElementById('input-award-title');
          if (inputTitle) inputTitle.focus();
        }
      });
    }

    if (btnCancelAdd && formWrapper) {
      btnCancelAdd.addEventListener('click', () => {
        formWrapper.style.display = 'none';
      });
    }

    // Submit New Award
    const btnSubmitAdd = document.getElementById('btn-submit-add-award');
    if (btnSubmitAdd) {
      btnSubmitAdd.addEventListener('click', () => this.submitNewAward());
    }

    // Re-cheer & Confetti burst
    const btnReCheer = document.getElementById('btn-re-cheer');
    if (btnReCheer) {
      btnReCheer.addEventListener('click', () => {
        if (window.confettiEngine) window.confettiEngine.celebrate();
        if (window.soundEngine) window.soundEngine.playCheer();
        if (window.stageSync) {
          window.stageSync.broadcast('CONFETTI');
          window.stageSync.broadcast('SOUND_CHEER');
        }
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
    this.resetTimer(false);

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

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('POSE_SELECT', { poseIndex: index });
    }
  }

  revealPose(startCountdown = true, broadcast = true) {
    if (this.isRevealed) return;
    this.isRevealed = true;

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
      window.app.showToast('👀 Pha 1: 5 giây quan sát hình mẫu trên LED!', '5s');
    }
  }

  hidePose(showToast = true, broadcast = true) {
    this.isRevealed = false;
    this.stopTimer();
    if (broadcast && window.stageSync) window.stageSync.broadcast('POSE_HIDE');

    const cover = document.getElementById('pose-cover-overlay');
    if (cover) {
      cover.classList.remove('hidden');
      cover.classList.remove('phase-pose-active');
    }

    const toggleBtn = document.getElementById('pose-reveal-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Mở Dáng Chụp <span class="kbd-hint">O / Enter</span>';
      toggleBtn.classList.add('btn-gala-amber');
      toggleBtn.classList.remove('btn-gala-outline');
    }

    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) snapshotBanner.classList.remove('show');

    if (window.app && window.app.showToast && showToast) {
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
    if (this.phase === 'voted') {
      this.resetTimer(false);
    }

    // Start Phase 1 (Observe)
    if (this.phase === 'ready') {
      this.phase = 'observe';
      this.totalSeconds = this.observeSeconds;
      this.remainingSeconds = this.observeSeconds;
      this.isRevealed = true;

      const cover = document.getElementById('pose-cover-overlay');
      if (cover) {
        cover.classList.add('hidden');
        cover.classList.remove('phase-pose-active');
      }

      const toggleBtn = document.getElementById('pose-reveal-toggle-btn');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Che Dáng Chụp <span class="kbd-hint">O</span>';
        toggleBtn.classList.remove('btn-gala-amber');
        toggleBtn.classList.add('btn-gala-outline');
      }

      if (window.soundEngine) window.soundEngine.playHint();
      if (window.app && window.app.showToast) {
        window.app.showToast('👀 Pha 1: 5 giây quan sát hình mẫu trên LED!', '5s');
      }
    }

    this.isRunning = true;
    const btnStart = document.getElementById('pose-start-timer');
    if (btnStart) {
      const label = this.phase === 'observe' ? 'Đang Quan Sát' : 'Đang Tạo Dáng';
      btnStart.innerHTML = `<i class="fas fa-pause"></i> Tạm Dừng (${label}) <span class="kbd-hint">Space</span>`;
      btnStart.classList.add('running');
    }

    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) snapshotBanner.classList.remove('show');

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('POSE_START_TIMER', { phase: this.phase, seconds: this.remainingSeconds });
    }

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.updateTimerDisplay();

      if (this.phase === 'observe') {
        if (window.soundEngine) window.soundEngine.playTick();

        if (this.remainingSeconds <= 0) {
          // Transition to Phase 2: Pose (10s)
          this.phase = 'pose';
          this.totalSeconds = this.poseSeconds;
          this.remainingSeconds = this.poseSeconds;

          // Cover reference image on LED screen so teams cannot see it anymore
          const cover = document.getElementById('pose-cover-overlay');
          const coverTitle = document.getElementById('pose-cover-title');
          const coverSub = document.getElementById('pose-lock-subtitle');
          const coverIcon = document.getElementById('pose-cover-icon');
          const coverBtn = document.getElementById('pose-reveal-btn');

          if (cover) {
            cover.classList.remove('hidden');
            cover.classList.add('phase-pose-active');
          }
          if (coverTitle) coverTitle.textContent = '🔄 QUAY LƯNG LẠI MÀN LED! 10S BẮT ĐẦU!';
          if (coverSub) coverSub.textContent = '2 Đội không nhìn màn hình nữa • Khán giả được phép hỗ trợ reo hò hướng dẫn!';
          if (coverIcon) coverIcon.innerHTML = '<i class="fas fa-arrows-rotate fa-spin" style="--fa-animation-duration: 4s;"></i>';
          if (coverBtn) coverBtn.style.display = 'none';

          if (btnStart) {
            btnStart.innerHTML = `<i class="fas fa-pause"></i> Tạm Dừng (Tạo Dáng) <span class="kbd-hint">Space</span>`;
          }

          if (window.soundEngine) window.soundEngine.playWarningTick();

          if (window.app && window.app.showToast) {
            window.app.showToast('🔄 Hết 5s nhìn! 2 đội quay lưng lại LED, 10s tạo dáng bắt đầu!', '10s');
          }

          this.updateTimerDisplay();
        }
      } else if (this.phase === 'pose') {
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
      }
    }, 1000);
  }

  pauseTimer(broadcast = true) {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('POSE_PAUSE_TIMER', { seconds: this.remainingSeconds });
    }
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
      btnStart.innerHTML = '<i class="fas fa-play"></i> Bắt Đầu (5s Nhìn + 10s Dáng) <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }
  }

  resetTimer(broadcast = true) {
    this.stopTimer();
    this.phase = 'ready';
    this.totalSeconds = this.observeSeconds;
    this.remainingSeconds = this.observeSeconds;
    this.isRevealed = false;

    const cover = document.getElementById('pose-cover-overlay');
    const coverTitle = document.getElementById('pose-cover-title');
    const coverSub = document.getElementById('pose-lock-subtitle');
    const coverIcon = document.getElementById('pose-cover-icon');
    const coverBtn = document.getElementById('pose-reveal-btn');

    if (cover) {
      cover.classList.remove('hidden');
      cover.classList.remove('phase-pose-active');
    }
    if (coverTitle) coverTitle.textContent = 'DÁNG CHỤP ĐANG ĐƯỢC GIẤU KÍN';
    if (coverSub) coverSub.textContent = `${this.teamCount} Đội chuẩn bị sẵn sàng • Bấm Bắt Đầu để có 5 giây nhìn LED, sau đó quay lưng 10 giây tạo dáng!`;
    if (coverIcon) coverIcon.innerHTML = '<i class="fas fa-lock"></i>';
    if (coverBtn) {
      coverBtn.style.display = 'inline-block';
      coverBtn.innerHTML = '<i class="fas fa-play"></i> BẮT ĐẦU VÒNG THI (5s Nhìn + 10s Dáng) <span class="kbd-hint">Space / Enter</span>';
    }

    const toggleBtn = document.getElementById('pose-reveal-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fas fa-eye"></i> Mở Dáng Chụp <span class="kbd-hint">O / Enter</span>';
      toggleBtn.classList.add('btn-gala-amber');
      toggleBtn.classList.remove('btn-gala-outline');
    }

    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) snapshotBanner.classList.remove('show');

    const btnStart = document.getElementById('pose-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-play"></i> Bắt Đầu (5s Nhìn + 10s Dáng) <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }

    this.updateTimerDisplay();

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('POSE_RESET');
    }
  }

  triggerSnapshot() {
    this.stopTimer();
    this.phase = 'voted';

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

    // 3. Uncover reference image so audience can compare original with poses
    const cover = document.getElementById('pose-cover-overlay');
    if (cover) {
      cover.classList.add('hidden');
      cover.classList.remove('phase-pose-active');
    }

    // 4. Show Snapshot banner with Audience Applause voting prompt!
    const snapshotBanner = document.getElementById('pose-snapshot-banner');
    if (snapshotBanner) {
      snapshotBanner.classList.add('show');
    }

    // 5. Update start button
    const btnStart = document.getElementById('pose-start-timer');
    if (btnStart) {
      btnStart.innerHTML = '<i class="fas fa-check-double"></i> Khán Giả Chấm Điểm • Tiếp Tục <span class="kbd-hint">Space</span>';
      btnStart.classList.remove('running');
    }

    // 6. Confetti burst
    if (window.confettiEngine) {
      window.confettiEngine.burst(80);
    }

    this.updateTimerDisplay();
  }

  voteBothTeams() {
    this.addScore(1, 1);
    this.addScore(2, 1);
    if (window.soundEngine) window.soundEngine.playCheer();
    if (window.confettiEngine) window.confettiEngine.burst(40);
    if (window.app && window.app.showToast) {
      window.app.showToast('🤝 Khán giả bình chọn hòa: +1 điểm cho cả 2 đội!', 'Vui là chính');
    }
  }

  updateTimerDisplay() {
    const timerText = document.getElementById('pose-timer-text');
    const timerBar = document.getElementById('pose-timer-bar');
    const phaseBadge = document.getElementById('pose-phase-badge');

    if (timerText) {
      timerText.textContent = `${this.remainingSeconds}s`;
      timerText.classList.toggle('urgent', this.remainingSeconds <= 3);
    }

    if (timerBar) {
      const percentage = (this.remainingSeconds / this.totalSeconds) * 100;
      timerBar.style.width = `${percentage}%`;
      timerBar.classList.toggle('urgent', this.remainingSeconds <= 3);
    }

    if (phaseBadge) {
      if (this.phase === 'observe') {
        phaseBadge.textContent = `👀 PHA 1: QUAN SÁT LED (${this.remainingSeconds}s)`;
        phaseBadge.className = 'pose-phase-tag phase-observe';
      } else if (this.phase === 'pose') {
        phaseBadge.textContent = `🔄 PHA 2: QUAY LƯNG TẠO DÁNG (${this.remainingSeconds}s)`;
        phaseBadge.className = 'pose-phase-tag phase-pose';
      } else if (this.phase === 'voted') {
        phaseBadge.textContent = `👏 KHÁN GIẢ CHẤM ĐIỂM (VỖ TAY / HÔ TO)`;
        phaseBadge.className = 'pose-phase-tag';
      } else {
        phaseBadge.textContent = `SẴN SÀNG: 5S NHÌN + 10S DÁNG`;
        phaseBadge.className = 'pose-phase-tag';
      }
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

  // =========================================================================
  // AWARD CEREMONY & DYNAMIC CUSTOM PRIZES MANAGEMENT (LEAD GAME)
  // =========================================================================
  loadCustomAwards() {
    try {
      const saved = localStorage.getItem('tlqm_custom_awards');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading custom awards:', e);
    }
    // Default preset awards
    return [
      {
        id: 'award-default-1',
        title: 'Giải Đội Trưởng Ấn Tượng',
        recipient: 'Đội Trưởng Xuất Sắc Nhất',
        prize: 'Ô Cầm Tay Cao Cấp Tà Lùng Quang Minh'
      },
      {
        id: 'award-default-2',
        title: 'Giải Tạo Dáng Bùng Nổ & Sáng Tạo',
        recipient: 'Đội Trình Diễn Cười Nghiêng Ngả Nhất',
        prize: 'Phần Quà Lưu Niệm Độc Đáo Tà Lùng Quang Minh'
      }
    ];
  }

  saveCustomAwards() {
    try {
      localStorage.setItem('tlqm_custom_awards', JSON.stringify(this.customAwards));
    } catch (e) {
      console.error('Error saving custom awards:', e);
    }
  }

  submitNewAward() {
    const inputTitle = document.getElementById('input-award-title');
    const selectRecipient = document.getElementById('select-award-recipient');
    const inputPrize = document.getElementById('input-award-prize');
    const formWrapper = document.getElementById('add-award-form-wrapper');

    const title = inputTitle ? inputTitle.value.trim() : '';
    const recipient = selectRecipient ? selectRecipient.value.trim() : '';
    const prize = inputPrize ? inputPrize.value.trim() : '';

    if (!title) {
      if (inputTitle) {
        inputTitle.focus();
        inputTitle.classList.add('error');
        setTimeout(() => inputTitle.classList.remove('error'), 800);
      }
      if (window.app && window.app.showToast) {
        window.app.showToast('⚠️ Vui lòng nhập tên giải thưởng!');
      }
      return;
    }

    const newAward = {
      id: 'award-' + Date.now(),
      title: title,
      recipient: recipient || 'Đội chơi xuất sắc',
      prize: prize || 'Phần Quà Kỷ Niệm Tà Lùng Quang Minh'
    };

    this.customAwards.push(newAward);
    this.saveCustomAwards();
    this.renderCustomAwards();

    if (inputTitle) inputTitle.value = '';
    if (inputPrize) inputPrize.value = '';
    if (formWrapper) formWrapper.style.display = 'none';

    if (window.soundEngine) window.soundEngine.playCorrect();
    if (window.app && window.app.showToast) {
      window.app.showToast(`🎖️ Lead Game đã thêm: ${newAward.title}!`);
    }

    if (window.stageSync) {
      window.stageSync.broadcast('CUSTOM_AWARDS_UPDATE', { customAwards: this.customAwards });
    }
  }

  deleteCustomAward(id) {
    this.customAwards = this.customAwards.filter(a => a.id !== id);
    this.saveCustomAwards();
    this.renderCustomAwards();

    if (window.soundEngine) window.soundEngine.playClick();
    if (window.app && window.app.showToast) {
      window.app.showToast('🗑️ Đã xóa giải thưởng');
    }

    if (window.stageSync) {
      window.stageSync.broadcast('CUSTOM_AWARDS_UPDATE', { customAwards: this.customAwards });
    }
  }

  populateRecipientOptions() {
    const select = document.getElementById('select-award-recipient');
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '';

    // Active teams first
    for (let i = 0; i < this.teamCount; i++) {
      const opt = document.createElement('option');
      opt.value = this.teamNames[i];
      opt.textContent = `${this.teamNames[i]} (${this.scores[i]} điểm)`;
      select.appendChild(opt);
    }

    // Special categories
    const specialCategories = [
      'Cá nhân xuất sắc nhất / Đội trưởng',
      'Cổ động viên / Khán giả nhiệt tình nhất',
      'Toàn thể các Đội chơi',
      'Thành viên trẻ tuổi / Năng động nhất',
      'Ban Trọng tài / Ban Tổ chức'
    ];
    specialCategories.forEach(txt => {
      const opt = document.createElement('option');
      opt.value = txt;
      opt.textContent = `★ ${txt}`;
      select.appendChild(opt);
    });

    if (currentVal) {
      select.value = currentVal;
    }
  }

  renderCustomAwards() {
    const list = document.getElementById('custom-awards-list');
    if (!list) return;

    if (!this.customAwards || this.customAwards.length === 0) {
      list.innerHTML = `
        <div style="color: var(--text-secondary); font-size: 0.85rem; font-style: italic; padding: 6px 4px;">
          Chưa có giải thưởng bổ sung nào. Lead Game có thể bấm <strong>"+ Thêm Giải Thưởng"</strong> để tạo thêm các giải phong cách, MVP, hoặc cổ động viên...
        </div>
      `;
      return;
    }

    list.innerHTML = this.customAwards.map(a => `
      <div class="custom-award-item" data-id="${a.id}">
        <div class="custom-award-info">
          <span class="custom-award-title-tag">🎖️ ${this.escapeHtml(a.title)}</span>
          <span class="custom-award-recipient"><i class="fas fa-user-check"></i> ${this.escapeHtml(a.recipient)}</span>
          <span class="custom-award-prize"><i class="fas fa-gift"></i> ${this.escapeHtml(a.prize)}</span>
        </div>
        <button type="button" class="btn-delete-award" title="Xóa giải này" onclick="window.poseGame.deleteCustomAward('${a.id}')">
          <i class="fas fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  closeAwardModal(broadcast = true) {
    const modal = document.getElementById('winner-modal');
    if (modal) modal.classList.remove('show');

    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('AWARD_MODAL_CLOSE');
    }
  }

  celebrateWinner(broadcast = true) {
    // 1. Collect active teams
    const activeTeams = [];
    for (let i = 0; i < this.teamCount; i++) {
      activeTeams.push({
        index: i,
        name: this.teamNames[i],
        score: this.scores[i]
      });
    }

    // 2. Sort by score descending
    activeTeams.sort((a, b) => b.score - a.score);

    const maxScore = activeTeams[0].score;
    const winners = activeTeams.filter(t => t.score === maxScore && maxScore > 0);

    let winnerText = '';
    let winnerSubtitle = '';

    if (maxScore <= 0) {
      winnerText = '🤝 CÁC ĐỘI ĐỒNG HẠNG!';
      winnerSubtitle = 'Chưa đội nào ghi điểm, cùng bứt phá ở các vòng thi tiếp theo!';
    } else if (winners.length === 1) {
      const w = winners[0];
      winnerText = `🏆 ${w.name} XUẤT SẮC CHIẾN THẮNG!`;
      winnerSubtitle = `Dẫn đầu với số điểm ấn tượng: ${w.score} điểm! Nhận ngay phần quà Quán quân danh giá từ Gala Tà Lùng Quang Minh! 🎁`;
    } else {
      const winNames = winners.map(w => w.name).join(' & ');
      winnerText = `🤝 ĐỒNG QUÁN QUÂN: ${winNames}!`;
      winnerSubtitle = `Các đội xuất sắc bằng điểm nhau (${maxScore} điểm)! Cùng nhận phần thưởng danh giá của Ban Tổ Chức! 🎉`;
    }

    const modalTitle = document.getElementById('winner-modal-title');
    const modalSub = document.getElementById('winner-modal-sub');
    if (modalTitle) modalTitle.textContent = winnerText;
    if (modalSub) modalSub.textContent = winnerSubtitle;

    // 3. Render Rankings Cards with official Excel gifts
    const rankingsContainer = document.getElementById('award-rankings-container');
    if (rankingsContainer) {
      rankingsContainer.innerHTML = '';

      activeTeams.forEach((team, idx) => {
        let rankClass = `rank-${idx + 1}`;
        let rankTitle = '';
        let badgeEmoji = '';
        let prizeName = '';
        let prizeSub = '';
        let prizeImg = '';

        if (team.score === maxScore && maxScore > 0) {
          rankClass = 'rank-1';
          badgeEmoji = '🥇';
          rankTitle = winners.length > 1 ? 'ĐỒNG QUÁN QUÂN' : 'QUÁN QUÂN';
          prizeName = 'Thùng Quà Bí Mật Đội Quán Quân';
          prizeSub = 'Phần quà Vô Địch chính thức Gameshow Gala Tà Lùng Quang Minh';
          prizeImg = 'assets/prizes/thung_qua_secret.svg';
        } else if (idx === 1 || (winners.length > 1 && team.score < maxScore && idx === winners.length)) {
          rankClass = 'rank-2';
          badgeEmoji = '🥈';
          rankTitle = 'Á QUÂN';
          prizeName = 'Thùng Quà Bí Mật Đội Á Quân';
          prizeSub = 'Phần quà Á Quân chính thức Gameshow Gala Tà Lùng Quang Minh';
          prizeImg = 'assets/prizes/thung_qua_secret.svg';
        } else {
          rankClass = 'rank-3';
          badgeEmoji = idx === 2 ? '🥉' : '🎖️';
          rankTitle = 'ĐỒNG ĐỘI / KHUYẾN KHÍCH';
          prizeName = 'Ô Cầm Tay Cao Cấp Tà Lùng Quang Minh';
          prizeSub = 'Trao tặng các thành viên kỷ niệm ra mắt thương hiệu Tà Lùng Quang Minh';
          prizeImg = 'assets/prizes/o_cam_tay_tlqm.svg';
        }

        const card = document.createElement('div');
        card.className = `award-rank-card ${rankClass}`;
        card.innerHTML = `
          <div class="award-rank-top">
            <div class="award-rank-badge">${badgeEmoji}</div>
            <div>
              <div class="award-team-name">${this.escapeHtml(team.name)}</div>
              <div class="award-team-score">${team.score} Điểm • ${rankTitle}</div>
            </div>
          </div>
          <div class="award-gift-box">
            <img src="${prizeImg}" alt="${prizeName}" class="award-gift-img" onerror="this.src='assets/prizes/thung_qua_secret.svg'" />
            <div>
              <div class="award-gift-name">${prizeName}</div>
              <div class="award-gift-sub">${prizeSub}</div>
            </div>
          </div>
        `;
        rankingsContainer.appendChild(card);
      });
    }

    // 4. Render Custom Awards and populate form dropdown
    this.populateRecipientOptions();
    this.renderCustomAwards();

    // Hide add form by default
    const formWrapper = document.getElementById('add-award-form-wrapper');
    if (formWrapper) formWrapper.style.display = 'none';

    // 5. Open modal
    const modal = document.getElementById('winner-modal');
    if (modal) modal.classList.add('show');

    // 6. Sound & Effects
    if (window.soundEngine) window.soundEngine.playCheer();
    if (window.confettiEngine) {
      window.confettiEngine.celebrate();
      setTimeout(() => window.confettiEngine.celebrate(), 700);
    }

    // 7. Broadcast to stage LED screen
    if (broadcast && window.stageSync) {
      window.stageSync.broadcast('AWARD_CEREMONY', {
        customAwards: this.customAwards
      });
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
